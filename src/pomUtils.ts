import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import * as fs from 'fs';
import * as path from 'path';
import { MavenDependency } from './mavenDependency';

export class PomUtils {

    constructor(private workspaceRoot: string | undefined) { }
    /** Decides whether there is a pom file in the workspace root and if it is a mule api pom */
    public isMulePom(): boolean {

        let pomDoc = this.getPomDocument();

        if (pomDoc) {

            // first, lets check the packaging node in the pom
            const packagingNodes = pomDoc.documentElement.getElementsByTagName('packaging');

            // there should only be 1 packaging node, and it should be set to 'mule-application'
            if (packagingNodes.length === 1 && packagingNodes.item(0).textContent === 'mule-application') {

                // now, lets check the build plugin
                const buildNodes = pomDoc.documentElement.getElementsByTagName('build');
                if (buildNodes.length === 1) {
                    const pluginsNode = buildNodes.item(0).getElementsByTagName('plugins');
                    if (pluginsNode.length === 1) {
                        const pluginNodes = pluginsNode.item(0).getElementsByTagName('plugin');

                        // there are possibly more than one build plugin, check them all
                        for (let i = 0; i < pluginNodes.length; i++) {
                            const plugin = pluginNodes.item(i);

                            const groupIdNodes = plugin.getElementsByTagName('groupId');
                            const artifactIdNodes = plugin.getElementsByTagName('artifactId');
                            if (groupIdNodes.length === 1 && artifactIdNodes.length === 1
                                && groupIdNodes.item(0).textContent === 'org.mule.tools.maven'
                                && artifactIdNodes.item(0).textContent === 'mule-maven-plugin') {
                                return true;
                            }
                        }
                    }
                }
            }
        }

        return false;
    }

    /** Reads all the dependencies in the pom file */
    public getPomDependencies(): MavenDependency[] {
        return this.readPomDependencies(undefined);
    }

    /** Reads all the dependencies that have the 'mule-plugin' classifier (which indicates a mule connector) */
    public getMuleConnectorDependencies(): MavenDependency[] {
        return this.readPomDependencies('mule-plugin');
    }

    /** Adds a matching dependency in the pom file and writes it back to the file */
    public addPomDependency(dependency: MavenDependency) {
        let pomDoc = this.getPomDocument();

        let dependenciesNode = this.getDependenciesNode(pomDoc);

        let dependencyElement = pomDoc.createElement('dependency');

        let groupId = pomDoc.createElement('groupId');
        let artifactId = pomDoc.createElement('artifactId');
        let version = pomDoc.createElement('version');
        let classifier = pomDoc.createElement('classifier');

        groupId.textContent = dependency.groupId;
        artifactId.textContent = dependency.artifactId;
        version.textContent = dependency.version;
        classifier.textContent = dependency.classifier;

        dependencyElement.appendChild(groupId);
        dependencyElement.appendChild(artifactId);
        if (dependency.version)
            dependencyElement.appendChild(version);
        if (dependency.classifier)
            dependencyElement.appendChild(classifier);

        dependenciesNode.appendChild(dependencyElement);

        this.setPomDocument(pomDoc);
    }

    /** Finds a matching dependency in the pom file and removes it */
    public removePomDependency(dependency: MavenDependency) {
        let pomDoc = this.getPomDocument();

        if (pomDoc) {
            let dependenciesNode = this.getDependenciesNode(pomDoc);

            if (!dependenciesNode)
                return;

            let dependencyNodes = dependenciesNode.getElementsByTagName('dependency');

            if (dependencyNodes) {
                for (let i = 0; i < dependencyNodes.length; i++) {
                    try {
                        let dependencyNode = dependencyNodes.item(i);

                        // get the groupid, artifactid, and version of this dependency (all required so assume they are present or fail completely)
                        let groupId = dependencyNode.getElementsByTagName('groupId').item(0).textContent;
                        let artifactId = dependencyNode.getElementsByTagName('artifactId').item(0).textContent;
                        let version = dependencyNode.getElementsByTagName('version').item(0).textContent;

                        if (dependency.groupId === groupId &&
                            dependency.artifactId === artifactId &&
                            dependency.version === version) {

                            dependencyNode.parentNode.removeChild(dependencyNode);

                            console.debug('removed a dependency ' + dependencyNode);
                            break;
                        }

                    } catch (e) {
                        console.error("ran into a problem trying to read pom dependencies: " + e.message);
                        return [];
                    }
                }
            }

            this.setDependenciesNode(dependenciesNode, pomDoc);
        }

    }

    /** Reusable method to read the dependecies in the pom file with an optional filter to help find mule connectors */
    private readPomDependencies(classifierFilter: string | undefined): MavenDependency[] {
        let pomDependencies: MavenDependency[] = [];

        const dependencyNodes = this.getDependenciesNode()?.getElementsByTagName('dependency');

        for (let i = 0; i < dependencyNodes.length; i++) {
            try {

                // get the groupid, artifactid, and version of this dependency (all required so assume they are present or fail completely)
                let groupId = dependencyNodes.item(i).getElementsByTagName('groupId').item(0).textContent;
                let artifactId = dependencyNodes.item(i).getElementsByTagName('artifactId').item(0).textContent;
                let version = dependencyNodes.item(i).getElementsByTagName('version').item(0).textContent;

                // get the classifier if there is one
                let classifier = undefined;
                let classifierNodes = dependencyNodes.item(i).getElementsByTagName('classifier');
                if (classifierNodes.length === 1) {
                    classifier = classifierNodes.item(0).textContent;
                }

                // add this to the collection if there is no filter, or if it matches the filter
                if (!classifierFilter || classifierFilter === classifier)
                    pomDependencies.push({ groupId, artifactId, version });

            } catch (e) {
                console.error("ran into a problem trying to read pom dependencies");
                return [];
            }
        }

        return pomDependencies;
    }

    /** Reusable method to parse the pom file down to just the dependencies section */
    private getDependenciesNode(pomDoc?: Document): Element | undefined {

        if (!pomDoc) {
            pomDoc = this.getPomDocument();
        }

        if (pomDoc) {
            const dependenciesNodes = pomDoc.documentElement.getElementsByTagName('dependencies');

            if (dependenciesNodes.length === 1) {
                return dependenciesNodes.item(0)
            }
        }

        return undefined;
    }

    /** Reusable method to write out the pom file with the new dependencies section */
    private setDependenciesNode(dependenciesElement: Element, pomDoc?: Document) {

        if (!pomDoc) {
            pomDoc = this.getPomDocument();
        }

        if (pomDoc) {
            const dependenciesNodes = pomDoc.documentElement.getElementsByTagName('dependencies');

            if (dependenciesNodes.length === 1) {

                dependenciesNodes[0].parentNode.removeChild(dependenciesNodes[0]);
                dependenciesNodes[0].parentNode.appendChild(dependenciesElement);

                this.setPomDocument(pomDoc);
            }
        }

    }

    /** Reusable method to read and parse the pom file from this workspace */
    private getPomDocument() {
        let pomFile = path.join(this.workspaceRoot, 'pom.xml');
        if (this.pathExists(pomFile)) {

            let pomContentsStr = fs.readFileSync(pomFile, 'utf-8');

            return new DOMParser().parseFromString(pomContentsStr, 'text/xml');
        }

        return undefined;
    }

    /** Reusable method to serialize the pom and rewrite it to the file */
    private setPomDocument(pomDoc: Document) {
        let pomString = new XMLSerializer().serializeToString(pomDoc);

        let pomFile = path.join(this.workspaceRoot, 'pom.xml');

        fs.writeFileSync(pomFile, pomString);
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