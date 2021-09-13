import axios from 'axios';


export function getAllAssets() {
    try {
        return axios.get('https://anypoint.mulesoft.com/exchange/api/v2/assets/search');
    }
    catch (error) {
        return error;
    }
}
