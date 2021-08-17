
const Product = require('../../../models/video/videoModel');
const categoryModel = require('../../../models/video/videoCategoryModel');
const productModel = require('../../../models/video/videoModel');

/* 
Routes 
/products get
/products post add products
/buyproduct
*/

//to retrive all products
const product = {};

//Shopping Home Screen
product.getHomeScreen = async (callback, event) => {
    try {
        let client_id = event.queryStringParameters.client_id
        var catList = await categoryModel.getAllCategory(client_id);
        var newSubs = []
        for (let index = 0; index < catList.length; index++) {
            const element = catList[index];
            var products = await productModel.getProductByCategory(client_id, element.category_id)
            var sections = {
                "category_img": element.photo,
                "title": element.title,
                "id": element.category_id,
                "product": products
            };
            newSubs.push(sections);

        }

        sendResponse(callback, 200, 'Shopping Screen', newSubs);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}

product.viewAllProduct = async (callback, event) => {
    try {
        let client_id = event.queryStringParameters.client_id
        let category_id = event.queryStringParameters.category_id
        var catList = await categoryModel.getAllSubCategory(client_id, category_id);
        var newSubs = []
        for (let index = 0; index < catList.length; index++) {
            const element = catList[index];
            var products = await productModel.getProductBySubCategory(client_id, element.category_id)
            var sections = {
                "category_img": element.photo,
                "title": element.title,
                "id": element.category_id,
                "product": products
            };
            newSubs.push(sections);

        }

        sendResponse(callback, 200, 'View All Results', newSubs);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}


product.getRelatedProduct = async (callback, event) => {
    try {
        let client_id = event.queryStringParameters.client_id
        let category_id = event.queryStringParameters.category_id
        var products = await productModel.getProductBySubCategory(client_id, category_id)
        sendResponse(callback, 200, 'View All Results', products);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}

product.getProductById = async (callback, event) => {
    try {
        let client_id = event.queryStringParameters.client_id
        let category_id = event.queryStringParameters.product_id
        var products = await productModel.getProductById(client_id, category_id)
        sendResponse(callback, 200, 'Product Description', products);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}


product.getAllProduct = async (callback, event) => {
    try {
        let client_id = event.queryStringParameters.client_id
        const newSubs = await Product.getAllProduct(client_id);
        sendResponse(callback, 200, 'Product List', newSubs);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}

//to add products
product.addProduct = async (callback, event) => {
    const requestBody = JSON.parse(event.body);
    if (!requestBody) sendResponse(callback, 400, 'Product object not found', null)
    try {
        if (!requestBody.client_id) requestBody.client_id = event.headers.client_id;
        const newSubs = await Product.addProduct(requestBody);
        if (!newSubs) {
            sendResponse(callback, 400, 'Error in Adding New Product', null);
        }
        sendResponse(callback, 200, 'Product Added', null);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}

//to Update products
product.updateProduct = async (callback, event) => {
    const requestBody = JSON.parse(event.body);
    if (!requestBody) sendResponse(callback, 400, 'Product object not found', null)
    try {
        if (!requestBody.client_id) requestBody.client_id = event.headers.client_id;
        const newSubs = await Product.updateProduct(requestBody);
        if (!newSubs) {
            sendResponse(callback, 400, 'Error in Updating New Product', null);
        }
        sendResponse(callback, 200, 'Product Updated', null);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}

//to delete products
product.deleteProduct = async (callback, event) => {

    var uuid = event.queryStringParameters.uuid;
    var client_id = event.queryStringParameters.client_id;
    if (!uuid) sendResponse(callback, 400, 'Product Id Not found', null)
    try {

        const res = await Product.deleteProduct(uuid, client_id);
        console.log(res);
        if (!res) {
            sendResponse(callback, 400, 'Product Deleting Failed', null);
        }

        sendResponse(callback, 200, 'Product Deleted', null);
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

module.exports = product;