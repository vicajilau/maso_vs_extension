import * as vscode from 'vscode';

export function configureLanguageAssociation(context: vscode.ExtensionContext) {
    // Force association of .maso files with maso language aggressively
    const configuration = vscode.workspace.getConfiguration();
    
    // Get current file associations
    const currentAssociations = configuration.get<{ [key: string]: string }>('files.associations') || {};
    
    // Add .maso association
    const updatedAssociations = {
        ...currentAssociations,
        '*.maso': 'maso'
    };
    
    // Set for both workspace and global with higher priority
    configuration.update('files.associations', updatedAssociations, vscode.ConfigurationTarget.Workspace);
    configuration.update('files.associations', updatedAssociations, vscode.ConfigurationTarget.Global);
    
    // Force immediate re-evaluation of all open documents
    setTimeout(() => {
        vscode.workspace.textDocuments.forEach(doc => {
            if (doc.fileName.toLowerCase().endsWith('.maso') && doc.languageId !== 'maso') {
                console.log(`Setting language for ${doc.fileName} from ${doc.languageId} to maso`);
                vscode.languages.setTextDocumentLanguage(doc, 'maso').then(() => {
                    console.log(`Successfully set language for ${doc.fileName}`);
                }, (error) => {
                    console.error(`Failed to set language for ${doc.fileName}:`, error);
                });
            }
        });
    }, 100);
}
