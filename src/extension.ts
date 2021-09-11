'use strict';

import * as vscode from 'vscode';

import { DepMuleProvider, MuleDependency } from './muleDependencies';

export function activate(context: vscode.ExtensionContext) {
	const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

	// Samples of `window.registerTreeDataProvider`
	const nodeDependenciesProvider = new DepMuleProvider(rootPath);
	vscode.window.registerTreeDataProvider('importedConnectors', nodeDependenciesProvider);
	vscode.commands.registerCommand('importedConnectors.refreshEntry', () => nodeDependenciesProvider.refresh());
	// vscode.commands.registerCommand('extension.openPackageOnNpm', moduleName => vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://www.npmjs.com/package/${moduleName}`)));
	// vscode.commands.registerCommand('importedConnectors.addEntry', () => vscode.window.showInformationMessage(`Successfully called add entry.`));

	// TODO: hook these buttons up to exchange client and pomutils as needed.
	vscode.commands.registerCommand('importedConnectors.editEntry', (node: MuleDependency) => vscode.window.showInformationMessage(`This button is in-progress. Called on: ${node.label}.`));
	vscode.commands.registerCommand('importedConnectors.deleteEntry', (node: MuleDependency) => vscode.window.showInformationMessage(`This button is in-progress. Called on: ${node.label}.`));

	// const jsonOutlineProvider = new JsonOutlineProvider(context);
	// vscode.window.registerTreeDataProvider('jsonOutline', jsonOutlineProvider);
	// vscode.commands.registerCommand('jsonOutline.refresh', () => jsonOutlineProvider.refresh());
	// vscode.commands.registerCommand('jsonOutline.refreshNode', offset => jsonOutlineProvider.refresh(offset));
	// vscode.commands.registerCommand('jsonOutline.renameNode', offset => jsonOutlineProvider.rename(offset));
	// vscode.commands.registerCommand('extension.openJsonSelection', range => jsonOutlineProvider.select(range));

	// Samples of `window.createView`
	// new FtpExplorer(context);
	// new FileExplorer(context);

	// Test View
	// new TestView(context);

	// Drag and Drop sample
	// new TestViewDragAndDrop(context);
}