import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { MavenDependency } from './mavenDependency';
import { PomUtils } from './pomUtils';

export class DepMuleProvider implements vscode.TreeDataProvider<MuleDependency> {

	private _onDidChangeTreeData: vscode.EventEmitter<MuleDependency | undefined | void> = new vscode.EventEmitter<MuleDependency | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<MuleDependency | undefined | void> = this._onDidChangeTreeData.event;

	constructor(private workspaceRoot: string | undefined) {
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: MuleDependency): vscode.TreeItem {
		return element;
	}

	getChildren(element?: MuleDependency): Thenable<MuleDependency[]> {
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No dependency in empty workspace');
			return Promise.resolve([]);
		}

		if (element) {
			// we only care about the root level of this view being mule deps, return nothing for children
			return Promise.resolve([]);
		} else {
			const pomPath = path.join(this.workspaceRoot, 'pom.xml');
			if (this.pathExists(pomPath)) {
				return Promise.resolve(this.getDepsInPomFile());
			} else {
				vscode.window.showInformationMessage('Workspace has no pom.xml');
				return Promise.resolve([]);
			}
		}

	}

	/**
	 * Read all the dependencies in the pom file
	 */
	private getDepsInPomFile(): MuleDependency[] {

		// init our utils
		const pomUtils = new PomUtils(this.workspaceRoot);

		// gets all the maven dependencies that are mule connectors
		const muleConnectorDeps = pomUtils.getMuleConnectorDependencies();

		// if we found mule deps, create the tree items and return them, otherwise return nothing
		return muleConnectorDeps
			? muleConnectorDeps.map(dep => MuleDependency.fromMavenDep(dep))
			: [];
	}

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}

		return true;
	}
}

export class MuleDependency extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		public readonly groupId: string,
		public readonly artifactId: string,
		public readonly version: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);

		this.tooltip = `${this.label}-${this.version}`;
		this.description = this.version;
	}

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	};

	contextValue = 'dependency';

	public static fromMavenDep(mavenDep: MavenDependency) {
		return new MuleDependency(`${mavenDep.groupId}:${mavenDep.artifactId}`,
			mavenDep.groupId,
			mavenDep.artifactId,
			mavenDep.version,
			vscode.TreeItemCollapsibleState.None);
	}

	public static toMavenDep(muleDep: MuleDependency) {
		return {
			groupId: muleDep.groupId,
			artifactId: muleDep.artifactId,
			version: muleDep.version
		} as MavenDependency;
	}

	public removeFromPom(workspaceRoot: string) {
		new PomUtils(workspaceRoot).removePomDependency(MuleDependency.toMavenDep(this));
	}
}
