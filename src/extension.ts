'use strict';

import * as vscode from 'vscode';
import { getAsset } from './exchangeClient';
import { MavenDependency } from './mavenDependency';

import { ImportedMuleDepProvider, FeaturedMuleDepProvider, MuleDependency } from './muleDependencies';
import { PomUtils } from './pomUtils';

let pomUtils: PomUtils = undefined;

export function activate(context: vscode.ExtensionContext) {
	const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

	pomUtils = new PomUtils(rootPath);

	setupImportedConnectorsView(rootPath);
	setupFeaturedConnectorsView(rootPath);

}

const setupImportedConnectorsView = (rootPath: string) => {

	// creates a provider to populate the tree view
	const muleDependenciesProvider = new ImportedMuleDepProvider(rootPath);
	vscode.window.registerTreeDataProvider('importedConnectors', muleDependenciesProvider);

	// called when the refresh button is selected
	vscode.commands.registerCommand('mule.importedConnectors.refreshEntry', () => muleDependenciesProvider.refresh());

	// called when the edit button is selected for an imported connector
	vscode.commands.registerCommand('mule.importedConnectors.editEntry', (node: MuleDependency) => {
		// must go get a list of versions we can use
		getAsset(node.mavenDependency.groupId, node.mavenDependency.artifactId).then(asset => {

			// put the current version at the top
			let importedConnectorVersions = [{ label: node.mavenDependency.version, description: "Current Version" } as vscode.QuickPickItem];

			// append the rest of the versions to the list
			importedConnectorVersions = importedConnectorVersions.concat(asset.data.versions.map(version => { return { label: version } as vscode.QuickPickItem }))

			// show the quick picker
			vscode.window.showQuickPick(importedConnectorVersions, {
				onDidSelectItem: (selectedVersion) => {

					// we shouldn't touch the pom file if the current version is selected from the picker
					if ((selectedVersion as vscode.QuickPickItem).label === node.mavenDependency.version)
						return;

					// take the existing dep, and change the version
					let newDep = MuleDependency.toMavenDep(node);
					newDep.version = (selectedVersion as vscode.QuickPickItem).label;

					// add the new dep to the pom file
					pomUtils.updatePomDependencyVersion(newDep);
				},
				canPickMany: false,
				title: "Connector Version Selection"
			});
		});
	});

	// event handler for the delete button on a dep
	vscode.commands.registerCommand('mule.importedConnectors.deleteEntry', (node: MuleDependency) => {
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

	// called when the add button is pushed on a featured connector
	vscode.commands.registerCommand('mule.exchangeFeatured.addEntry', (node: MuleDependency) => {

		// must go get a list of versions
		getAsset(node.mavenDependency.groupId, node.mavenDependency.artifactId).then(asset => {
			// build a list of quick pick items for the versions
			let quickPickVersions = asset.data.versions.map(version => { return { label: version } as vscode.QuickPickItem });

			vscode.window.showQuickPick(quickPickVersions, {
				onDidSelectItem: (selectedVersionPickItem) => {

					let selectedVersion = (selectedVersionPickItem as vscode.QuickPickItem).label;

					let mavenDep = {
						groupId: asset.data.groupId,
						artifactId: asset.data.assetId,
						version: selectedVersion,
						classifier: "mule-plugin"
					} as MavenDependency;

					// we don't want to duplicate this dep if it is already in the pom
					if (pomUtils.containsMuleConnectorDependency(mavenDep)) {

						// update the version of the dependency in the pom file
						pomUtils.updatePomDependencyVersion(mavenDep);
					} else {
						// add the new dep to the pom file
						pomUtils.addPomDependency(mavenDep);
					}
				},
				canPickMany: false,
				title: "Connector Version Selection"
			})
		});
	});
}