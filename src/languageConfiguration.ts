import * as vscode from 'vscode';

export function configureLanguageAssociation(context: vscode.ExtensionContext) {
    // Force association of .maso files with maso language aggressively
    const configuration = vscode.workspace.getConfiguration();
    
    // Set for both workspace and global
    configuration.update('files.associations', {
        '*.maso': 'maso'
    }, vscode.ConfigurationTarget.Workspace);
    
    configuration.update('files.associations', {
        '*.maso': 'maso'
    }, vscode.ConfigurationTarget.Global);
    
    // Also force any currently open .maso files to use maso language
    vscode.workspace.textDocuments.forEach(doc => {
        if (doc.fileName.endsWith('.maso') && doc.languageId !== 'maso') {
            vscode.languages.setTextDocumentLanguage(doc, 'maso');
        }
    });
}
