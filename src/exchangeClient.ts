import axios from 'axios';
import * as vscode from 'vscode';

export function getAllAssets(type?: string) {
    try {
        if (type) {
            return axios.get(`https://anypoint.mulesoft.com/exchange/api/v2/assets/search?types=${type}`);
        } else {
            return axios.get('https://anypoint.mulesoft.com/exchange/api/v2/assets/search');
        }
    }
    catch (error) {
        return error;
    }
}

export function getAsset(groupId: string, assetId: string): Promise<undefined | { data: FullAsset }> {
    try {
        return (axios.get(`https://anypoint.mulesoft.com/exchange/api/v2/assets/${groupId}/${assetId}/asset`) as Promise<{ data: FullAsset }>).catch(error => { console.error(error); return undefined; });
    }
    catch (error) {
        return Promise.resolve(undefined);
    }
}

export interface FullAsset {
    "groupId": string,
    "assetId": string,
    "version": string,
    "minorVersion": string,
    "organizationId": string,
    "description": string,
    "versionGroup": string,
    "isPublic": boolean,
    "name": string,
    "type": string,
    "status": string,
    "contactEmail": string | undefined,
    "contactName": string | undefined,
    "labels": string[],
    "attributes": { value: string, key: string }[],
    "categories": {
        value: string[],
        displayName: string,
        key: string
    }[],
    "customFields": [],
    "files": {
        "classifier": string,
        "packaging": string,
        "downloadURL": string,
        "externalLink": string,
        "md5": string,
        "sha1": string,
        "createdDate": string,
        "mainFile": any,
        "isGenerated": boolean
    }[],
    "dependencies": [],
    "createdAt": string,
    "createdById": string,
    "versions": string[]
}

