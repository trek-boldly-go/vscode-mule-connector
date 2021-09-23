import axios from 'axios';
import * as qs from 'qs';

export async function getAllAssets(params: AssetSearchParams): Promise<undefined | any> {
    try {
        return await (axios.get('https://anypoint.mulesoft.com/exchange/api/v2/assets/search', {
            params,
            paramsSerializer: paramsSerializer
        })) as any;
    }
    catch (error) {
        console.error(error);
        return undefined;
    }
}

export async function getAsset(groupId: string, assetId: string): Promise<undefined | {
    data: FullAsset,
    status: number,
    statusText: string,
    headers: any,
    request?: any,
}> {
    try {
        return await (axios.get(`https://anypoint.mulesoft.com/exchange/api/v2/assets/${groupId}/${assetId}/asset`)) as {
            data: FullAsset,
            status: number,
            statusText: string,
            headers: any,
            request?: any,
        };
    }
    catch (error) {
        console.error(error);
        return undefined;
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

// a type to allow search params to be sent to exchange api
export interface AssetSearchParams {
    types?: string,
    limit?: number,
    offset?: number,
    sort?: string,
    ascending?: boolean,
    search?: string,
    domain?: string,
    organizationId?: string,
    masterOrganizationId?: string,
    minMuleVersion?: string,
    sharedWithMe?: boolean,
    includeSnapshots?: boolean
}

interface params {
    [key: string]: string
}

// must override the default paramsSerializer so null params are skipped
const paramsSerializer = (params: params): string => {
    return qs.stringify(params, { skipNulls: true });
}
