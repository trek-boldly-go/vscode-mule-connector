'use strict';

import axios from 'axios';


export function getAllAssets() {
    try{
        const response = axios.get('https://anypoint.mulesoft.com/exchange/api/v2/assets/search');
        return response;
    }
    catch (error) {
        return error;
    }
}