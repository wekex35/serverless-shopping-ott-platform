const Category = require('../../../models/shopping/categoryModel')

/* 
Routes 
/categorys get
/categorys post add categorys
/buycategory
*/

//to retrive all categorys
const category = {};
category.getAllCategory = async (callback, event) => {
    
    try {
        let client_id = event.queryStringParameters.client_id
        const newSubs = await Category.getAllCategory(client_id);
        sendResponse(callback, 200, 'Category List', newSubs);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}



//to add categorys
category.addCategory = async (callback, event) => {
    const requestBody = JSON.parse(event.body);
    if (!requestBody) sendResponse(callback, 400, 'Category object not found', null)
    try {
        if (!requestBody.client_id) requestBody.client_id = event.headers.client_id;
        const newSubs = await Category.addCategory(requestBody);
        if (!newSubs) {
            sendResponse(callback, 400, 'Error in Adding New Category', null);
        }
        sendResponse(callback, 200, 'Category Added', newSubs);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}

//to Update categorys
category.updateCategory = async (callback, event) => {
    const requestBody = JSON.parse(event.body);
    if (!requestBody) sendResponse(callback, 400, 'Category object not found', null)
    try {
        if (!requestBody.client_id) requestBody.client_id = event.headers.client_id;
        const newSubs = await Category.updateCategory(requestBody);
        if (!newSubs) {
            sendResponse(callback, 400, 'Error in Adding New Category', null);
        }
        sendResponse(callback, 200, 'Category Updated', null);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}

//to delete categorys
category.deleteCategory = async (callback, event) => {
    var category_id = event.queryStringParameters.uuid;
    var client_id = event.queryStringParameters.client_id;
    if (!category_id) sendResponse(callback, 400, 'Category Id Not found', null)
    try {

        const res = await Category.deleteCategory(category_id,client_id);
        console.log(res);
        if (!res) {
            sendResponse(callback, 400, 'Category Purchase Failed', null);
        }
        sendResponse(callback, 200, 'Category Deleted', null);
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

module.exports = category;