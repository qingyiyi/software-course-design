import { CodeActionProvider, TextDocument, Range, CodeActionContext, CancellationToken, CodeAction, CodeActionKind, WorkspaceEdit, ExtensionContext, languages } from 'vscode';

export class SysyCodeActionProvider implements CodeActionProvider {
    public static providedCodeActionKinds = [
        CodeActionKind.Refactor
    ];

    provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken): CodeAction[] {
        const actions: CodeAction[] = [];
        console.log('debuginfo(sysy-2022-action-provider.ts): provideCodeActions called, context:', { context });
        console.log('debuginfo(2): provideCodeActions called, context:', { context },'token:',{token},'textdocument:',{document});

        // 提供重构操作：重命名变量
        const refactorAction = this.createRenameVariableAction(document, range, 'Refactor: Rename variable');
        actions.push(refactorAction);

        return actions;
    }

    private createRenameVariableAction(document: TextDocument, range: Range, title: string): CodeAction {
        const action = new CodeAction(title, CodeActionKind.Refactor);
        action.edit = new WorkspaceEdit();
        
        // 获取变量名称并生成新名称（此处简单示例为在变量名后加 "_new"）
        const oldVariableName = document.getText(range);
        const newVariableName = `${oldVariableName}_new`;
        console.log('debuginfo(cr): createRenameVariableAction called, TextDocument:', { document },'oldVariableName:',{oldVariableName},'newVariableName:',{newVariableName});
        // 在变量定义和使用位置进行替换
        const text = document.getText();
        const regex = new RegExp(`\\b${oldVariableName}\\b`, 'g');
        let match;
        while ((match = regex.exec(text)) !== null) {
            const matchRange = new Range(
                document.positionAt(match.index),
                document.positionAt(match.index + oldVariableName.length)
            );
            action.edit.replace(document.uri, matchRange, newVariableName);
        }
        return action;
    }

}
    // 在 activate 函数中注册 CodeActionProvider
    export function activateCodeActionProvider(context: ExtensionContext) {
        // 创建 SysyCodeActionProvider 实例
        const codeActionProvider = new SysyCodeActionProvider();
        console.log(typeof(languages.registerCodeActionsProvider('sysy-2022', codeActionProvider)));
        return languages.registerCodeActionsProvider('sysy-2022', codeActionProvider);
    }