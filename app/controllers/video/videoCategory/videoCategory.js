const VideoCategory = require('../../../models/video/videoCategoryModel')

/* 
Routes 
/videoCategorys get
/videoCategorys post add videoCategorys
/videoCuycategory
*/

//to retrive all videoCategorys
const videoCategory = {};
videoCategory.getAllVideoCategory = async (callback, event) => {
    
    try {
        let client_id = event.queryStringParameters.client_id
        const newSubs = await VideoCategory.getAllVideoCategory(client_id);
        sendResponse(callback, 200, 'Video Category List', newSubs);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}



//to add videoCategorys
videoCategory.addVideoCategory = async (callback, event) => {
    const requestBody = JSON.parse(event.body);
    if (!requestBody) sendResponse(callback, 400, 'Video Category object not found', null)
    try {
        if (!requestBody.client_id) requestBody.client_id = event.headers.client_id;
        const newSubs = await VideoCategory.addVideoCategory(requestBody);
        if (!newSubs) {
            sendResponse(callback, 400, 'Error in Adding New VideoCategory', null);
        }
        sendResponse(callback, 200, 'VideoCategory Added', newSubs);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}

//to Update videoCategorys
videoCategory.updateVideoCategory = async (callback, event) => {
    const requestBody = JSON.parse(event.body);
    if (!requestBody) sendResponse(callback, 400, 'Video Category object not found', null)
    try {
        if (!requestBody.client_id) requestBody.client_id = event.headers.client_id;
        const newSubs = await VideoCategory.updateVideoCategory(requestBody);
        if (!newSubs) {
            sendResponse(callback, 400, 'Error in Adding New Video Category', null);
        }
        sendResponse(callback, 200, 'Video Category Updated', null);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}

//to delete videoCategorys
videoCategory.deleteVideoCategory = async (callback, event) => {
    var videoCategory_id = event.queryStringParameters.uuid;
    var client_id = event.queryStringParameters.client_id;
    if (!videoCategory_id) sendResponse(callback, 400, 'VideoCategory Id Not found', null)
    try {

        const res = await VideoCategory.deleteVideoCategory(videoCategory_id,client_id);
        console.log(res);
        if (!res) {
            sendResponse(callback, 400, 'Video Category Purchase Failed', null);
        }
        sendResponse(callback, 200, 'Video Category Deleted', null);
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

module.exports = videoCategory;