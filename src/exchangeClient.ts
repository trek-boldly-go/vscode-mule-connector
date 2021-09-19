import axios from 'axios';
import { Console } from 'console';


export function getAllAssets(type?:string) {
    try {
        if(type)
        {
            return axios.get(`https://anypoint.mulesoft.com/exchange/api/v2/assets/search?types=${type}`);    
        }else
        {
        return axios.get('https://anypoint.mulesoft.com/exchange/api/v2/assets/search');
        }
    }
    catch (error) {
        return error;
    }
};


export function getAssetByGrpIdAssetId(groupId:string, assetId:string){

    try{
        return axios.get(`https://anypoint.mulesoft.com/exchange/api/v2/assets/${groupId}/${assetId}/asset`);
    }
    catch(error) {
        return error;
    }

};