const CartItem = require('../../../models/shopping/cartItemModel')

/* 
Routes 
/cartItem get
/cartItem post add cartItem
/buycartItem
*/

//to retrive all cartItem
const cartItem = {};
cartItem.getAllCartItem = async (callback, event) => {
    
    try {
        let user_id = event.queryStringParameters.user_id
        const newSubs = await CartItem.getAllCartItem(user_id);
        sendResponse(callback, 200, 'CartItem List', newSubs);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}

//to add cartItem
cartItem.addCartItem = async (callback, event) => {
    const requestBody = JSON.parse(event.body);
    if (!requestBody) sendResponse(callback, 400, 'CartItem object not found', null)
    try {
        if (!requestBody.client_id) requestBody.client_id = event.headers.client_id;
        const newSubs = await CartItem.addCartItem(requestBody);
        if (!newSubs) {
            sendResponse(callback, 400, 'Error in Adding New CartItem', null);
        }
        sendResponse(callback, 200, 'CartItem Added', null);
    } catch (error) {
        console.log(error);
        sendResponse(callback, 400, error.message || error, null)
    }
}

//to Update cartItem
cartItem.updateCartItem = async (callback, event) => {
    const requestBody = JSON.parse(event.body);
    if (!requestBody) sendResponse(callback, 400, 'CartItem object not found', null)
    try {
        if (!requestBody.client_id) requestBody.client_id = event.headers.client_id;
        const newSubs = await CartItem.updateCartItem(requestBody);
        if (!newSubs) {
            sendResponse(callback, 400, 'Error in Adding New CartItem', null);
        }
        sendResponse(callback, 200, 'CartItem Updated', null);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}

//to delete cartItem
cartItem.deleteCartItem = async (callback, event) => {
    var product_id = event.queryStringParameters.product_id;
    var user_id = event.queryStringParameters.user_id;
    if (!product_id) sendResponse(callback, 400, 'CartItem Id Not found', null)
    try {
        const res = await CartItem.deleteCartItem(product_id,user_id);
        console.log(res);
        if (!res) {
            sendResponse(callback, 400, 'CartItem Delete Failed', null);
        }
        sendResponse(callback, 200, 'CartItem Deleted', null);
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

module.exports = cartItem;