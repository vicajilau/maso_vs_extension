import * as vscode from 'vscode';
import { configureLanguageAssociation } from './languageConfiguration';

let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {
  console.log('MASO File Support extension is now active!');

  // Configure language association
  configureLanguageAssociation(context);

  // Create diagnostic collection
  diagnosticCollection = vscode.languages.createDiagnosticCollection('maso');
  context.subscriptions.push(diagnosticCollection);

  // Force language detection for .maso files
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(document => {
      if (document.fileName.endsWith('.maso') && document.languageId !== 'maso') {
        vscode.languages.setTextDocumentLanguage(document, 'maso');
      }
    })
  );

  // Also check active editor on activation
  if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.fileName.endsWith('.maso') && vscode.window.activeTextEditor.document.languageId !== 'maso') {
    vscode.languages.setTextDocumentLanguage(vscode.window.activeTextEditor.document, 'maso');
  }

  // Validate files when opened or changed
  if (vscode.window.activeTextEditor && isMasoFile(vscode.window.activeTextEditor.document)) {
    validateMasoFile(vscode.window.activeTextEditor.document);
  }

  // Listener for editor changes
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor && isMasoFile(editor.document)) {
        validateMasoFile(editor.document);
      }
    })
  );

  // Listener for document changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      if (isMasoFile(event.document)) {
        validateMasoFile(event.document);
      }
    })
  );

  // Command to validate manually
  const validateCommand = vscode.commands.registerCommand('maso-file-support.validateFile', () => {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && isMasoFile(activeEditor.document)) {
      validateMasoFile(activeEditor.document);
      vscode.window.showInformationMessage('MASO file validation completed!');
    } else {
      vscode.window.showWarningMessage('Please open a .maso file to validate.');
    }
  });

  context.subscriptions.push(validateCommand);
}

function isMasoFile(document: vscode.TextDocument): boolean {
  return document.fileName.endsWith('.maso');
}

function validateMasoFile(document: vscode.TextDocument) {
  const diagnostics: vscode.Diagnostic[] = [];
  
  try {
    const text = document.getText();
    const jsonData = JSON.parse(text);
    
    // Validaciones básicas de estructura
    validateBasicStructure(document, jsonData, diagnostics);
    
    // Validaciones específicas según el modo
    if (jsonData.processes && jsonData.processes.mode && jsonData.processes.elements) {
      const mode = jsonData.processes.mode;
      
      if (mode === 'burst') {
        validateBurstMode(document, jsonData.processes.elements, diagnostics);
      } else if (mode === 'regular') {
        validateRegularMode(document, jsonData.processes.elements, diagnostics);
      } else {
        addDiagnostic(document, diagnostics, `Invalid mode: ${mode}. Must be one of: regular, burst`, 'mode');
      }
    }
    
  } catch (error) {
    // Error de parseo JSON
    const lines = document.getText().split('\n');
    const diagnostic = new vscode.Diagnostic(
      new vscode.Range(0, 0, lines.length - 1, lines[lines.length - 1].length),
      'Invalid JSON format in MASO file',
      vscode.DiagnosticSeverity.Error
    );
    diagnostics.push(diagnostic);
  }
  
  diagnosticCollection.set(document.uri, diagnostics);
}

function validateBasicStructure(document: vscode.TextDocument, jsonData: any, diagnostics: vscode.Diagnostic[]) {
  // Validate metadata
  if (!jsonData.metadata) {
    addDiagnostic(document, diagnostics, 'Missing required field: metadata', 'metadata');
  } else {
    if (!jsonData.metadata.name) {
      addDiagnostic(document, diagnostics, 'Missing required field: metadata.name', 'name');
    }
    if (!jsonData.metadata.version) {
      addDiagnostic(document, diagnostics, 'Missing required field: metadata.version', 'version');
    }
    if (!jsonData.metadata.description) {
      addDiagnostic(document, diagnostics, 'Missing required field: metadata.description', 'description');
    }
  }
  
  // Validate processes
  if (!jsonData.processes) {
    addDiagnostic(document, diagnostics, 'Missing required field: processes', 'processes');
  } else {
    if (!jsonData.processes.mode) {
      addDiagnostic(document, diagnostics, 'Missing required field: processes.mode', 'mode');
    }
    if (!jsonData.processes.elements || !Array.isArray(jsonData.processes.elements)) {
      addDiagnostic(document, diagnostics, 'Missing or invalid field: processes.elements (must be an array)', 'elements');
    }
  }
}

function validateRegularMode(document: vscode.TextDocument, elements: any[], diagnostics: vscode.Diagnostic[]) {
  const ids = new Set<string>();
  
  elements.forEach((element, index) => {
    const elementPath = `elements[${index}]`;
    
    // Verify required fields exist
    if (!element.id) {
      addDiagnostic(document, diagnostics, `Missing required field: ${elementPath}.id`, 'id');
    }
    if (element.arrival_time === undefined || element.arrival_time === null) {
      addDiagnostic(document, diagnostics, `Missing required field: ${elementPath}.arrival_time`, 'arrival_time');
    }
    if (element.service_time === undefined || element.service_time === null) {
      addDiagnostic(document, diagnostics, `Missing required field: ${elementPath}.service_time`, 'service_time');
    }
    if (element.enabled === undefined || element.enabled === null) {
      addDiagnostic(document, diagnostics, `Missing required field: ${elementPath}.enabled`, 'enabled');
    }
    
    // Verify correct types
    if (element.id !== undefined && typeof element.id !== 'string') {
      addDiagnostic(document, diagnostics, `${elementPath}.id must be a string`, 'id');
    }
    if (element.arrival_time !== undefined && (!Number.isInteger(element.arrival_time) || typeof element.arrival_time !== 'number')) {
      addDiagnostic(document, diagnostics, `${elementPath}.arrival_time must be an integer`, 'arrival_time');
    }
    if (element.service_time !== undefined && (!Number.isInteger(element.service_time) || typeof element.service_time !== 'number')) {
      addDiagnostic(document, diagnostics, `${elementPath}.service_time must be an integer`, 'service_time');
    }
    if (element.enabled !== undefined && typeof element.enabled !== 'boolean') {
      addDiagnostic(document, diagnostics, `${elementPath}.enabled must be a boolean (true or false)`, 'enabled');
    }
    
    // Verify values (only if types are correct)
    if (typeof element.arrival_time === 'number' && element.arrival_time < 0) {
      addDiagnostic(document, diagnostics, `${elementPath}.arrival_time must be non-negative`, 'arrival_time');
    }
    if (typeof element.service_time === 'number' && element.service_time < 0) {
      addDiagnostic(document, diagnostics, `${elementPath}.service_time must be non-negative`, 'service_time');
    }
    
    // Verify duplicate IDs
    if (element.id && ids.has(element.id)) {
      addDiagnostic(document, diagnostics, `Duplicate process ID: ${element.id}`, 'id');
    }
    if (element.id) {
      ids.add(element.id);
    }
  });
}

function validateBurstMode(document: vscode.TextDocument, elements: any[], diagnostics: vscode.Diagnostic[]) {
  const ids = new Set<string>();
  
  elements.forEach((element, index) => {
    const elementPath = `elements[${index}]`;
    
    // Verify required fields for burst mode
    if (!element.id) {
      addDiagnostic(document, diagnostics, `Missing required field: ${elementPath}.id`, 'id');
    }
    if (element.arrival_time === undefined || element.arrival_time === null) {
      addDiagnostic(document, diagnostics, `Missing required field: ${elementPath}.arrival_time`, 'arrival_time');
    }
    if (element.enabled === undefined || element.enabled === null) {
      addDiagnostic(document, diagnostics, `Missing required field: ${elementPath}.enabled`, 'enabled');
    }
    if (!element.threads || !Array.isArray(element.threads)) {
      addDiagnostic(document, diagnostics, `Missing or invalid field: ${elementPath}.threads (must be an array)`, 'threads');
    }
    
    // Verify types for burst mode
    if (element.id !== undefined && typeof element.id !== 'string') {
      addDiagnostic(document, diagnostics, `${elementPath}.id must be a string`, 'id');
    }
    if (element.arrival_time !== undefined && (!Number.isInteger(element.arrival_time) || typeof element.arrival_time !== 'number')) {
      addDiagnostic(document, diagnostics, `${elementPath}.arrival_time must be an integer`, 'arrival_time');
    }
    if (element.enabled !== undefined && typeof element.enabled !== 'boolean') {
      addDiagnostic(document, diagnostics, `${elementPath}.enabled must be a boolean (true or false)`, 'enabled');
    }
    
    // Verify values (only if types are correct)
    if (typeof element.arrival_time === 'number' && element.arrival_time < 0) {
      addDiagnostic(document, diagnostics, `${elementPath}.arrival_time must be non-negative`, 'arrival_time');
    }
    
    // Verify duplicate IDs
    if (element.id && ids.has(element.id)) {
      addDiagnostic(document, diagnostics, `Duplicate process ID: ${element.id}`, 'id');
    }
    if (element.id) {
      ids.add(element.id);
    }
    
    // Validate threads
    if (element.threads && Array.isArray(element.threads)) {
      const threadIds = new Set<string>();
      
      element.threads.forEach((thread: any, threadIndex: number) => {
        const threadPath = `${elementPath}.threads[${threadIndex}]`;
        
        if (!thread.id) {
          addDiagnostic(document, diagnostics, `Missing required field: ${threadPath}.id`, 'id');
        }
        if (thread.enabled === undefined || thread.enabled === null) {
          addDiagnostic(document, diagnostics, `Missing required field: ${threadPath}.enabled`, 'enabled');
        }
        if (!thread.bursts || !Array.isArray(thread.bursts)) {
          addDiagnostic(document, diagnostics, `Missing or invalid field: ${threadPath}.bursts (must be an array)`, 'bursts');
        }
        
        // Verify thread types
        if (thread.id !== undefined && typeof thread.id !== 'string') {
          addDiagnostic(document, diagnostics, `${threadPath}.id must be a string`, 'id');
        }
        if (thread.enabled !== undefined && typeof thread.enabled !== 'boolean') {
          addDiagnostic(document, diagnostics, `${threadPath}.enabled must be a boolean (true or false)`, 'enabled');
        }
        
        // Verify duplicate thread IDs
        if (thread.id && threadIds.has(thread.id)) {
          addDiagnostic(document, diagnostics, `Duplicate thread ID in ${elementPath}: ${thread.id}`, 'id');
        }
        if (thread.id) {
          threadIds.add(thread.id);
        }
        
        // Validate bursts
        if (thread.bursts && Array.isArray(thread.bursts)) {
          thread.bursts.forEach((burst: any, burstIndex: number) => {
            const burstPath = `${threadPath}.bursts[${burstIndex}]`;
            
            if (!burst.type) {
              addDiagnostic(document, diagnostics, `Missing required field: ${burstPath}.type`, 'type');
            } else if (typeof burst.type !== 'string') {
              addDiagnostic(document, diagnostics, `${burstPath}.type must be a string`, 'type');
            } else if (!['cpu', 'io'].includes(burst.type)) {
              addDiagnostic(document, diagnostics, `Invalid burst type: ${burst.type}. Must be 'cpu' or 'io'`, 'type');
            }
            
            if (burst.duration === undefined || burst.duration === null) {
              addDiagnostic(document, diagnostics, `Missing required field: ${burstPath}.duration`, 'duration');
            } else if (!Number.isInteger(burst.duration) || typeof burst.duration !== 'number') {
              addDiagnostic(document, diagnostics, `${burstPath}.duration must be an integer`, 'duration');
            } else if (burst.duration < 0) {
              addDiagnostic(document, diagnostics, `${burstPath}.duration must be non-negative`, 'duration');
            }
          });
        }
      });
    }
  });
}

function addDiagnostic(document: vscode.TextDocument, diagnostics: vscode.Diagnostic[], message: string, searchTerm: string) {
  const text = document.getText();
  const lines = text.split('\n');
  
  let line = 0;
  let character = 0;
  
  // Search for the line containing the term
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`"${searchTerm}"`)) {
      line = i;
      character = lines[i].indexOf(`"${searchTerm}"`);
      break;
    }
  }
  
  const range = new vscode.Range(line, character, line, lines[line]?.length || 0);
  const diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error);
  diagnostics.push(diagnostic);
}

export function deactivate() {
  if (diagnosticCollection) {
    diagnosticCollection.dispose();
  }
}
