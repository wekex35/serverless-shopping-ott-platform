
const DbHandler = require('../../utils/dbhandler')
const Subscription = require('../../models/subscriptionModel')
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const TableName = "SubscriptionTable";
/* 
Routes 
/subscriptions get
/subscriptions post add subscriptions
/buysubscription
*/

//to retrive all subscriptions
const subscription = {};
subscription.getSubscriptions = async (callback, event) => {
    try {
        const newSubs = await Subscription.getAllSubscription();       
        sendResponse(callback, 200, 'Subscription List', newSubs);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}

//to add subscriptions
subscription.addSubscription = async (callback, event) => {
    const requestBody = JSON.parse(event.body);
    if (!requestBody) sendResponse(callback, 400, 'Subscription object not found', null)
    try {
        if(!requestBody.client_id) requestBody.client_id = event.headers.client_id;
        const newSubs = await Subscription.addSubscription(requestBody);
        if (!newSubs) {
            sendResponse(callback, 400, 'Error in Adding New Subscription', null);
        }
        sendResponse(callback, 200, 'Subscription Added', null);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}

//to Update subscriptions
subscription.updateSubscription = async (callback, event) => {
    const requestBody = JSON.parse(event.body);
    if (!requestBody) sendResponse(callback, 400, 'Subscription object not found', null)
    try {
        requestBody.client_id = event.headers.client_id;
        const newSubs = await Subscription.updateSubscription(requestBody);
        if (!newSubs) {
            sendResponse(callback, 400, 'Error in Adding New Subscription', null);
        }
        sendResponse(callback, 200, 'Subscription Added', null);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}

//to buy subscriptions
subscription.buySubscription = async (callback, event) => {   
    const requestBody = JSON.parse(event.body);
    if (!requestBody) sendResponse(callback, 400, 'Subscription object not found', null)
    try {
        console.log(requestBody);
        if (!requestBody.transaction_id) sendResponse(callback, 400, 'Transaction Id required', null)
        requestBody.email = event.user.email;
        requestBody.client_id = event.headers.client_id;
        const res = await Subscription.buySubscription(requestBody);
        if (!res) {
            sendResponse(callback, 400, 'Subscription Purchase Failed', null);
        }
        sendResponse(callback, 200, 'Subscription Purchased', null);
    } catch (error) {
        
        sendResponse(callback, 400, error.message || error, null)
    }
}

//Cancel subscriptions
subscription.cancelSubscription = async (callback, event) => {  
    var body = JSON.parse(event.body)
    console.log(body);
    if (!body) sendResponse(callback, 400, 'Request body not found', null)
    try {
        event.uuid = body.uuid;
        const res = await Subscription.cancelSubscription(event);
        if (!res) {
            sendResponse(callback, 400, 'Subscription Cancelling Failed', null);
        }
        sendResponse(callback, 200, 'Subscription Cancelled', null);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}

//Upgrade subscriptions
subscription.upgradeSubscription = async (callback, event) => {   
    var body = JSON.parse(event.body)
    console.log(body);
    if (!body) sendResponse(callback, 400, 'Request body not found', null)
    try {
        event.uuid = body.uuid;
        const res = await Subscription.upgradeSubscription(event);
        if (!res) {
            sendResponse(callback, 400, 'Subscription Upgrading Failed', null);
        }
        sendResponse(callback, 200, 'Subscription Upgraded', null);
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

module.exports = subscription;