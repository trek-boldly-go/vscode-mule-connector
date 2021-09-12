'use strict';
//exports.__esModule = true;
//exports.getAllAssets = void 0;
//var axios_1 = require("axios");
import axios from 'axios';
export function getAllAssets() {
    try {
        var response = axios["default"].get('https://anypoint.mulesoft.com/exchange/api/v2/assets/search');
        return response;
    }
    catch (error) {
        return error;
    }
}
//exports.getAllAssets = getAllAssets;
