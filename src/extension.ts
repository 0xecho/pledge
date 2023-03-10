import * as vscode from 'vscode';

import { getAllBranches, getDiff, GetDiffOptions } from './gitHelpers';

function generatePledge ({ fromBranch, toBranch, directory }: GetDiffOptions) {
	const diff = getDiff({
		fromBranch,
		toBranch,
		directory
	});

	if (!diff) {
		vscode.window.showInformationMessage(`No difference to generate Pledge for`);
		return;
	}

	vscode.workspace.openTextDocument({
		content: `--- DIFF BEGIN ---
${diff}
--- DIFF END ---
`,
		language: 'plaintext'
	}).then(doc => {
		vscode.window.showTextDocument(doc, 1, false).then(editor => {
			const newLastLine: string = `The above diff is uncommitted, and is going to be commited
What are some good conventional commit messages for the above changes?

1. `;

			editor.edit(editBuilder => {
				editBuilder.insert(new vscode.Position(editor.document.lineCount, 0), newLastLine);
				editor.selection = new vscode.Selection(new vscode.Position(editor.document.lineCount, 0), new vscode.Position(editor.document.lineCount, 0));
			}
			).then(success => {
				if (success) {
					vscode.commands.executeCommand('github.copilot.generate');
				}
			});
		});
	});
}

export function activate (context: vscode.ExtensionContext) {

	vscode.commands.registerCommand('pledge.generate', () => {
		try {
			const allBranches = getAllBranches({ directory: vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor!.document.uri)?.uri.fsPath });
			vscode.window.showQuickPick(allBranches, {
				placeHolder: `Please select the branch to generate Pledge for`,
				ignoreFocusOut: true,
				canPickMany: false
			}).then(input => {
				if (input === undefined) {
					return;
				}

				generatePledge({
					fromBranch: input,
					toBranch: '',
					directory: vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor!.document.uri)?.uri.fsPath
				});

			});
		} catch (err) {
			vscode.window.showErrorMessage(`Something went wrong getting branches in current repo.`);
			console.error(err);
		}
	});

	vscode.commands.registerCommand('pledge.generateToDefaultBranch', () => {
		const defaultBranchName: string = vscode.workspace.getConfiguration('pledge').get('defaultBranchName') || 'main';
		try {
			generatePledge({
				fromBranch: defaultBranchName,
				toBranch: '',
				directory: vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor!.document.uri)?.uri.fsPath
			});
		} catch (err) {
			vscode.window.showErrorMessage(`Something went wrong generating Pledge to default branch ${defaultBranchName}`);
			console.error(err);
		}
	});


}

export function deactivate () { }

