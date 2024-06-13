import {  Diagnostic as VscodeDiagnostic,window,CodeActionProvider, TextDocument, Range, CodeActionContext, CancellationToken, CodeAction, CodeActionKind, WorkspaceEdit, 
    ExtensionContext, languages, workspace, commands } from 'vscode';

export class SysyCodeActionProvider implements CodeActionProvider {
    dispose(): void {
        //console.log('SysyCodeActionProvider is disposed');
    }

    public static readonly providedCodeActionKinds = [
        CodeActionKind.QuickFix,
        CodeActionKind.RefactorRewrite
    ];


    provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken): CodeAction[] {
        const actions: CodeAction[] = [];
        
/******add quickfix******/ 
    context.diagnostics.forEach(diagnostic => {
        if (diagnostic.code === 'VarNotDeclared') { // Match the custom error code
            const fixDeclare = new CodeAction(`Fix: ${diagnostic.message}`, CodeActionKind.QuickFix);
            fixDeclare.command = { command: 'extension.addDecl', title: 'Apply Quick Fix', arguments: [document, range, diagnostic] };
            fixDeclare.diagnostics = [diagnostic];
            fixDeclare.isPreferred = true;
            actions.push(fixDeclare);
        }
        if (diagnostic.code === 'NeverUsed') {
            const deleteUnusedDeclarationAction = new CodeAction('Delete unused declaration', CodeActionKind.QuickFix);
            deleteUnusedDeclarationAction.command = { command: 'extension.deleteUnusedDeclaration', title: 'Delete unused declaration', arguments: [document, range] };
            deleteUnusedDeclarationAction.diagnostics = [diagnostic];
            deleteUnusedDeclarationAction.isPreferred = true; // Optional: make it the preferred fix
            actions.push(deleteUnusedDeclarationAction);
        }
        // if (diagnostic.code === 'NotSuitableType') {
        //     const fixTypeAction = new CodeAction('Change to float', CodeActionKind.QuickFix);
        //     fixTypeAction.command = { command: 'extension.changeToFloat', title: 'Change to float', arguments: [document, range] };
        //     fixTypeAction.diagnostics = [diagnostic];
        //     fixTypeAction.isPreferred = true; // Optional: make it the preferred fix
        //     actions.push(fixTypeAction);
        // }
    });
/******add quickfix end******/ 

        // 提供重构操作：重命名变量
        const selectedText = document.getText(range);
        const regex = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
        // Check if the selected text is a valid variable name
        if (regex.test(selectedText)) {
            const renameAction = new CodeAction('Rename Variable', CodeActionKind.RefactorRewrite);
            renameAction.command = { command: 'extension.renameVariable', title: 'Rename Variable', arguments: [document, range, selectedText] };
            actions.push(renameAction);
        }
        return actions;
    }

/******【如果快速修复比较复杂，在此处实现函数】******/ 

/******add quickfix end******/ 

}

export function activateCodeActionProvider(context: ExtensionContext) {
    const provider = new SysyCodeActionProvider();
    const disposable = languages.registerCodeActionsProvider('sysy-2022', provider, {
        providedCodeActionKinds: SysyCodeActionProvider.providedCodeActionKinds
    });

/******add quickfix******/ 
    // 此处均为对快速修复的注册（实现）
    context.subscriptions.push(commands.registerCommand('extension.addDecl', async (document: TextDocument, range: Range, diagnostic: VscodeDiagnostic) => {
        const edit = new WorkspaceEdit();
        // Prompt the user to select the type of declaration
        const type = await window.showQuickPick(['int', 'float'], {
            placeHolder: 'Select the type of declaration to add'
        });
        if (!type) {
            // If no type is selected, do nothing
            return;
        }
        const startPos = range.start;
        const typePrefix = `${type} `;

        edit.insert(document.uri, startPos, typePrefix);
        await workspace.applyEdit(edit);
    }));

    // context.subscriptions.push(commands.registerCommand('extension.changeToFloat', async (document: TextDocument, range: Range) => {
    //     const edit = new WorkspaceEdit();
        
    //     // Replace the current text with 'float'
    //     edit.replace(document.uri, range, 'float');

    //     await workspace.applyEdit(edit);
    // }));

    // Register the command for deleting unused declaration
    context.subscriptions.push(commands.registerCommand('extension.deleteUnusedDeclaration', async (document: TextDocument, range: Range) => {
        const edit = new WorkspaceEdit();

        // Find the full line of the declaration
        const line = document.lineAt(range.start.line);
        const text = line.text.trim();

        // Different cases for single variable, multiple variables, with/without initialization
        const variablePattern = /(?:int|float|const)\s+([^;]+);/;
        const match = variablePattern.exec(text);

        if (match) {
            const declarations = match[1].split(',').map(declaration => declaration.trim());

            // Remove the unused variable from the list of declarations
            const updatedDeclarations = declarations.filter(declaration => {
                const varName = declaration.split('=')[0].trim();
                return varName !== document.getText(range);
            });

            // Reconstruct the declaration line
            if (updatedDeclarations.length > 0) {
                const updatedText = `${text.split(' ')[0]} ${updatedDeclarations.join(', ')};`;
                edit.replace(document.uri, line.range, updatedText);
            } else {
                // If no declarations are left, delete the entire line
                edit.delete(document.uri, line.range);
            }
        }

        await workspace.applyEdit(edit);
    }));
/******add quickfix end******/ 

    context.subscriptions.push(disposable);

    context.subscriptions.push({
        dispose: () => provider.dispose()
    });

    context.subscriptions.push(commands.registerCommand('extension.renameVariable', async (document: TextDocument, range: Range, oldName: string) => {
        const newName = await window.showInputBox({
            prompt: `Rename variable '${oldName}' to:`,
            value: oldName
        });

        if (!newName || newName === oldName) {
            return;
        }

        const edit = new WorkspaceEdit();
        const text = document.getText();
        const regex = new RegExp(`\\b${oldName}\\b`, 'g');
        let match;

        while ((match = regex.exec(text)) !== null) {
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + oldName.length);
            edit.replace(document.uri, new Range(startPos, endPos), newName);
        }

        await workspace.applyEdit(edit);
    }));
}