'use strict';

import * as vscode from 'vscode';

import { ImportedMuleDepProvider, FeaturedMuleDepProvider, MuleDependency } from './muleDependencies';
import { PomUtils } from './pomUtils';

export function activate(context: vscode.ExtensionContext) {
	const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

	setupImportedConnectorsView(rootPath);
	setupFeaturedConnectorsView(rootPath);

}

const setupImportedConnectorsView = (rootPath: string) => {

	// creates a provider to populate the tree view
	const muleDependenciesProvider = new ImportedMuleDepProvider(rootPath);
	vscode.window.registerTreeDataProvider('importedConnectors', muleDependenciesProvider);
	vscode.commands.registerCommand('importedConnectors.refreshEntry', () => muleDependenciesProvider.refresh());
	// vscode.commands.registerCommand('extension.openPackageOnNpm', moduleName => vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://www.npmjs.com/package/${moduleName}`)));
	// vscode.commands.registerCommand('importedConnectors.addEntry', () => vscode.window.showInformationMessage(`Successfully called add entry.`));

	// TODO: when the exchange client is ready to go, make this pull a list of versions that the user can pick from to make updates easier
	vscode.commands.registerCommand('importedConnectors.editEntry', (node: MuleDependency) => {
		vscode.window.showInformationMessage(`This button is in-progress and the versions you see listed are a static list. Called on: ${node.label}.`)

		vscode.window.showQuickPick([
			{ label: node.mavenDependency.version, description: "Current Version" } as vscode.QuickPickItem,
			{ label: "1.10.4" } as vscode.QuickPickItem,
			{ label: "1.10.3" } as vscode.QuickPickItem,
			{ label: "1.10.2" } as vscode.QuickPickItem,
			{ label: "1.10.1" } as vscode.QuickPickItem
		], {
			onDidSelectItem: (selectedVersion) => {

				// we shouldn't touch the pom file if the current version is selected from the picker
				if ((selectedVersion as vscode.QuickPickItem).label === node.mavenDependency.version)
					return;

				// take the existing dep, and change the version
				let newDep = MuleDependency.toMavenDep(node);
				newDep.version = (selectedVersion as vscode.QuickPickItem).label;

				// add the new dep to the pom file
				new PomUtils(rootPath).updatePomDependencyVersion(newDep);
			},
			canPickMany: false,
			title: "Connector Version Selection"
		})
	});

	// event handler for the delete button on a dep
	vscode.commands.registerCommand('importedConnectors.deleteEntry', (node: MuleDependency) => {
		// removes the dep from the pom file
		node.removeFromPom(rootPath);

		// must refresh the view now that the dep is gone
		muleDependenciesProvider.refresh();
	});
}


const setupFeaturedConnectorsView = (rootPath: string) => {

	// creates a provider to populate the tree view
	const muleDependenciesProvider = new FeaturedMuleDepProvider(rootPath);
	vscode.window.registerTreeDataProvider('exchangeFeatured', muleDependenciesProvider);
}