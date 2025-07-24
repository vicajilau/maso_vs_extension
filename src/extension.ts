import * as vscode from 'vscode';
import Ajv from 'ajv';

// Schema para validar archivos MASO
const masoSchema = {
  type: 'object',
  properties: {
    metadata: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        version: { type: 'string' },
        description: { type: 'string' }
      },
      required: ['name', 'version', 'description'],
      additionalProperties: false
    },
    processes: {
      type: 'object',
      properties: {
        mode: { 
          type: 'string',
          enum: ['regular', 'priority', 'round_robin']
        },
        elements: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              arrival_time: { type: 'number', minimum: 0 },
              service_time: { type: 'number', minimum: 0 },
              enabled: { type: 'boolean' }
            },
            required: ['id', 'arrival_time', 'service_time', 'enabled'],
            additionalProperties: false
          }
        }
      },
      required: ['mode', 'elements'],
      additionalProperties: false
    }
  },
  required: ['metadata', 'processes'],
  additionalProperties: false
};

let diagnosticCollection: vscode.DiagnosticCollection;
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(masoSchema);

export function activate(context: vscode.ExtensionContext) {
  console.log('MASO File Support extension is now active!');

  // Crear colección de diagnósticos
  diagnosticCollection = vscode.languages.createDiagnosticCollection('maso');
  context.subscriptions.push(diagnosticCollection);

  // Validar archivos al abrirlos o cambiarlos
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor && isMasoFile(activeEditor.document)) {
    validateMasoFile(activeEditor.document);
  }

  // Listener para cambios en editores
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor && isMasoFile(editor.document)) {
        validateMasoFile(editor.document);
      }
    })
  );

  // Listener para cambios en documentos
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      if (isMasoFile(event.document)) {
        validateMasoFile(event.document);
      }
    })
  );

  // Comando para validar manualmente
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
    
    const isValid = validate(jsonData);
    
    if (!isValid && validate.errors) {
      for (const error of validate.errors) {
        const diagnostic = createDiagnostic(document, error);
        if (diagnostic) {
          diagnostics.push(diagnostic);
        }
      }
    }
    
    // Validaciones específicas adicionales
    if (jsonData.processes && jsonData.processes.elements) {
      validateProcessElements(document, jsonData.processes.elements, diagnostics);
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

function createDiagnostic(document: vscode.TextDocument, error: any): vscode.Diagnostic | null {
  const text = document.getText();
  const lines = text.split('\n');
  
  // Intentar encontrar la línea con el error
  let line = 0;
  let character = 0;
  
  if (error.instancePath) {
    const path = error.instancePath.replace(/^\//, '').split('/');
    const searchPattern = path[path.length - 1] || 'metadata|processes';
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchPattern)) {
        line = i;
        character = lines[i].indexOf(searchPattern);
        break;
      }
    }
  }
  
  const range = new vscode.Range(line, character, line, lines[line]?.length || 0);
  const message = `${error.message} (${error.instancePath || 'root'})`;
  
  return new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error);
}

function validateProcessElements(document: vscode.TextDocument, elements: any[], diagnostics: vscode.Diagnostic[]) {
  const ids = new Set<string>();
  
  elements.forEach((element, index) => {
    // Verificar IDs duplicados
    if (ids.has(element.id)) {
      const lines = document.getText().split('\n');
      let line = 0;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`"id": "${element.id}"`)) {
          line = i;
          break;
        }
      }
      
      const range = new vscode.Range(line, 0, line, lines[line].length);
      const diagnostic = new vscode.Diagnostic(
        range,
        `Duplicate process ID: ${element.id}`,
        vscode.DiagnosticSeverity.Warning
      );
      diagnostics.push(diagnostic);
    }
    ids.add(element.id);
    
    // Verificar tiempos negativos
    if (element.arrival_time < 0 || element.service_time < 0) {
      const lines = document.getText().split('\n');
      let line = 0;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`"id": "${element.id}"`)) {
          line = i;
          break;
        }
      }
      
      const range = new vscode.Range(line, 0, line, lines[line].length);
      const diagnostic = new vscode.Diagnostic(
        range,
        'Arrival time and service time must be non-negative',
        vscode.DiagnosticSeverity.Error
      );
      diagnostics.push(diagnostic);
    }
  });
}

export function deactivate() {
  if (diagnosticCollection) {
    diagnosticCollection.dispose();
  }
}
