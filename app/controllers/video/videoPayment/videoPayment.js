const Env = require('../../../../env')
const PlaceOrder = require('../../../models/video/videoPaymentModel');
const productModel = require('../../../models/video/videoModel');
const Transaction = require('../../../models/transactionModel')
// const product = require('../product/product');
const stripe = require('stripe')(Env.STRIPE_SECRET);
/* 
Routes 
/payPerView get
/payPerView post add payPerView
/buypayPerView
*/
//to retrive all payPerView
const payPerView = {};

payPerView.getAllPlaceOrder = async (callback, event) => {
    try {
        let user_id = event.queryStringParameters.user_id
        const newSubs = await PlaceOrder.getOrderHistory(user_id);
        sendResponse(callback, 200, 'PlaceOrder List', newSubs);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}

//to add payPerView
payPerView.payPerView = async (callback, event) => {
    const requestBody = JSON.parse(event.body);
    requestBody.client_id = event.queryStringParameters.client_id;
    requestBody.user_id = event.queryStringParameters.user_id;
    if (!requestBody) sendResponse(callback, 400, 'PlaceOrder object not found', null)
    try {
        if (!requestBody.client_id) requestBody.client_id = event.headers.client_id;
        const newSubs = await PlaceOrder.payPerView(requestBody);
        if (!newSubs) {
            sendResponse(callback, 400, 'Error in Adding New PlaceOrder', null);
        }
        sendResponse(callback, 200, 'PlaceOrder Added', null);
    } catch (error) {
        console.log(error);
        sendResponse(callback, 400, error.message || error, null)
    }
}


//to Update payPerView
payPerView.updateOrderStatus = async (callback, event) => {
    const requestBody = JSON.parse(event.body);
    if (!requestBody) sendResponse(callback, 400, 'PlaceOrder object not found', null)
    try {
        if (!requestBody.client_id) requestBody.client_id = event.headers.client_id;
        const newSubs = await PlaceOrder.updateOrderStatus(requestBody);
        if (!newSubs) {
            sendResponse(callback, 400, 'Error in Adding New PlaceOrder', null);
        }
        sendResponse(callback, 200, 'Order Status Updated', null);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}

//to delete payPerView
payPerView.deleteOrder = async (callback, event) => {
    var product_id = event.queryStringParameters.product_id;
    var user_id = event.queryStringParameters.user_id;
    if (!product_id) sendResponse(callback, 400, 'PlaceOrder Id Not found', null)
    try {

        const res = await PlaceOrder.deleteOrder(product_id, user_id);
        console.log(res);
        if (!res) {
            sendResponse(callback, 400, 'PlaceOrder Delete Failed', null);
        }
        sendResponse(callback, 200, 'PlaceOrder Deleted', null);
    } catch (error) {

        sendResponse(callback, 400, error.message || error, null)
    }
}

payPerView.orderPaymentIntent = async (callback, event) => {
    const requestBody = JSON.parse(event.body);
    var client_id = event.queryStringParameters.client_id
    var user_id = event.queryStringParameters.user_id
    if (!requestBody) sendResponse(callback, 200, "Body is rquired", null)
    try {
        if (!requestBody.items) sendResponse(callback, 200, "Cannot Proceed without Items", null)
        var items = requestBody.items;
        var subTotal = 0;
        for (let index = 0; index < items.length; index++) {
            const element = items[index];
            var product = await productModel.getProductById(client_id, element.product_id)
            subTotal += product.price * element.quantity;
        }
        var total = subTotal + requestBody.taxes + requestBody.shipping_charge;
  
        const stripeData = await stripe.paymentIntents.create({
            payment_method_types: [requestBody.payment_method],
            amount: total * 100, //stripe pay accepts pay in cents so cents to usd i.e 1 usd = 100cents
            currency: requestBody.currency,
        });

        var res = await Transaction.addTransaction({
            "trans_id": stripeData.id,
            "payment_method": requestBody.payment_method,
            "client_id": client_id,
            "user_email": user_id,//event.user.email,
            "subscription_code": requestBody.subscription_code,
            "amount": stripeData.amount / 100,
            "currency": stripeData.currency,
            "payment_status": stripeData.status,
            "created_on": stripeData.created,
            "is_active": true,
            "payment_gateway": requestBody.payment_gateway
        })
        if (!res) sendResponse(callback, 400, "Payment Intent creation Failed", null);
        sendResponse(callback, 200, "Transaction Intent created", stripeData);
    } catch (error) {
        //   console.log(error);
        sendResponse(callback, 400, error.message || error, null);
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

module.exports = payPerView;