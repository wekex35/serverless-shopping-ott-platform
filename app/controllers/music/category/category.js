const MusicCategory = require('../../../models/music/musicCategoryModel')

/* 
Routes 
/musicCategorys get
/musicCategorys post add musicCategorys
/musicCuycategory
*/

//to retrive all musicCategorys
const musicCategory = {};
musicCategory.getAllMusicCategory = async (callback, event) => {
    
    try {
        let client_id = event.queryStringParameters.client_id
        const newSubs = await MusicCategory.getAllMusicCategory(client_id);
        sendResponse(callback, 200, 'Music Category List', newSubs);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}



//to add musicCategorys
musicCategory.addMusicCategory = async (callback, event) => {
    const requestBody = JSON.parse(event.body);
    if (!requestBody) sendResponse(callback, 400, 'Music Category object not found', null)
    try {
        if (!requestBody.client_id) requestBody.client_id = event.headers.client_id;
        const newSubs = await MusicCategory.addMusicCategory(requestBody);
        if (!newSubs) {
            sendResponse(callback, 400, 'Error in Adding New MusicCategory', null);
        }
        sendResponse(callback, 200, 'MusicCategory Added', newSubs);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}

//to Update musicCategorys
musicCategory.updateMusicCategory = async (callback, event) => {
    const requestBody = JSON.parse(event.body);
    if (!requestBody) sendResponse(callback, 400, 'Music Category object not found', null)
    try {
        if (!requestBody.client_id) requestBody.client_id = event.headers.client_id;
        const newSubs = await MusicCategory.updateMusicCategory(requestBody);
        if (!newSubs) {
            sendResponse(callback, 400, 'Error in Adding New Music Category', null);
        }
        sendResponse(callback, 200, 'Music Category Updated', null);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}

//to delete musicCategorys
musicCategory.deleteMusicCategory = async (callback, event) => {
    var musicCategory_id = event.queryStringParameters.uuid;
    var client_id = event.queryStringParameters.client_id;
    if (!musicCategory_id) sendResponse(callback, 400, 'MusicCategory Id Not found', null)
    try {

        const res = await MusicCategory.deleteMusicCategory(musicCategory_id,client_id);
        console.log(res);
        if (!res) {
            sendResponse(callback, 400, 'Music Category Purchase Failed', null);
        }
        sendResponse(callback, 200, 'Music Category Deleted', null);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}



function sendResponse(callback, status, message, data) {
    const res = {
        statusCode: status,
        headers: {
            'Access-Control-Allow-Origin': '*', // Required for CORS support to work
            'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            data: data,
            message: message,
            status: status
        })
    };
    callback(null, res)
}

module.exports = musicCategory;