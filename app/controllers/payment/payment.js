const Env = require('../../../env')
const stripe = require('stripe')(Env.STRIPE_SECRET);
const Transaction = require('../../models/transactionModel')
const Subscription = require('../../models/subscriptionModel')
const paypal = require('paypal-rest-sdk');
const { promisify } = require('util');


const payment = {};
paypal.configure({
  'mode': Env.PAYPAL_MODE, //sandbox or live
  'client_id': Env.PAYPAL_CLIENT_ID,
  'client_secret': Env.PAYPAL_CLIENT_SECRET
});
// sb-4lyyn07108@business.example.com

payment.createStripePaymentIntent = async (callback, event) => {
  const requestBody = JSON.parse(event.body);
  if (!requestBody) sendResponse(callback, 200, "Body is rquired", null)
  try {
    if (!requestBody.subscription_code) sendResponse(callback, 200, "Subscription code is rquired", null)
    const subsDetails = await Subscription.getSubscriptionByCode(requestBody.subscription_code,event.headers.client_id);
    console.log(subsDetails);
    const stripeData = await stripe.paymentIntents.create({
      payment_method_types: ['card'],
      amount: subsDetails.amount * 100, //stripe pay accepts pay in cents so cents to usd i.e 1 usd = 100cents
      currency: subsDetails.currency,
    });

    var res = await Transaction.addTransaction({
      "trans_id": stripeData.id,
      "client_id": subsDetails.client_id,
      "user_email": event.user.email,
      "subscription_code": requestBody.subscription_code,
      "amount": stripeData.amount,
      "currency": stripeData.currency,
      "payment_status": stripeData.status,
      "created_on": stripeData.created,
      "is_active": true,    
      "payment_gateway":"stripe"  
    })
    if (!res) sendResponse(callback, 400, "Payment Intent creation Failed", null);
    sendResponse(callback, 200, "Transaction Intent created", stripeData);
  } catch (error) {
    console.log(error);
    sendResponse(callback, 400, error.message || error, null);
  }
}

payment.stripePaymentWebHook = async (callback, event) => {
  const requestBody = JSON.parse(event.body);
  try {
    const dataObject = requestBody.data.object
    var trans_id = dataObject.id;
    var status = dataObject.status
    
    if(requestBody.type == "charge.refunded"){
      trans_id = dataObject.refunds.data[0].payment_intent;
      status = dataObject.refunds.data[0].status;
    }
    var res = await Transaction.updateTransactionStatus(trans_id,dataObject.status)
    if (!res) sendResponse(callback, 400, "Transaction Update Failed", null);
    sendResponse(callback, 200, "Transaction Update", null);
  } catch (error) {
    console.log(error);
    sendResponse(callback, 400, error.message || error, null);
  }

}

payment.createPaypalPaymentIntent = async (callback, event) => {
  const requestBody = JSON.parse(event.body);
  if (!requestBody) sendResponse(callback, 200, "Body is rquired", null)
  try {
    if (!requestBody.subscription_code) sendResponse(callback, 200, "Subscription code is rquired", null)
    const subsDetails = await Subscription.getSubscriptionByCode(requestBody.subscription_code);
    var create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://return.url",
          "cancel_url": "http://cancel.url"
      },
      "transactions": [{
          "item_list": {
              "items": [{
                  "name":subsDetails.code,
                  "sku": subsDetails.code,
                  "price": subsDetails.amount,
                  "currency": subsDetails.currency.toUpperCase(),
                  "quantity": 1
              }]
          },
          "amount": {
            total: subsDetails.amount,
            currency: subsDetails.currency.toUpperCase()/* ,
              "currency": "USD",
              "total": "1.00" */
          },
          "description": "This is the payment description."
      }]
  };

  
  const paymentData = await paypalCreate(create_payment_json);

    console.log(paymentData);
    var res =  await Transaction.addTransaction({
      "trans_id": subsDetails.id,
      "user_email": event.user.email,
      "subscription_code" : requestBody.subscription_code,
      "amount": subsDetails.amount,
      "currency": subsDetails.currency,
      "payment_status": paymentData.state,
      "created_on":payment.create_time,
      "is_active": true,
      "client_id" : subsDetails.client_id
    })
    if (!res) sendResponse(callback, 400, "Payment Intent creation Failed", null);
    sendResponse(callback, 200, "Transaction Intent created", "stripeData");
  } catch (error) {
    sendResponse(callback, 400, error.message || error, null);
  }
}

function paypalCreate(create_payment_json){
  return new Promise(function(resolve,reject){
    paypal.payment.create(create_payment_json,function(error,payment){
      if(error){
       reject(error);
      }else{
       resolve(payment);
      }
    })
  });
  
}


payment.paypalPaymentWebHook = async (callback, event) => {
  const requestBody = JSON.parse(event.body);
  try {
    var res = await Transaction.updateTransactionStatus(requestBody)
    if (!res) sendResponse(callback, 400, "Transaction Update Failed", null);
    sendResponse(callback, 200, "Transaction Update", null);
  } catch (error) {
    sendResponse(callback, 400, error.message || error, null);
  }

}

payment.refundPayment = async (callback,event) => { 
  try{
  const data = JSON.parse(event.body);
  console.log(data.transaction_id);
  const trans_info = await Transaction.getTransactionById(data.transaction_id);
  console.log(trans_info);
  const refund = await stripe.refunds.create({
    amount: trans_info.amount*100,
    payment_intent: data.transaction_id,
  });
    console.log(refund);
    sendResponse(callback, 200, "Refunded "+refund.status, null);
  }catch(error){
    sendResponse(callback, 400, error.message || error, null);
  }
}

const refundStripePayment = async (cents,pi) => { 
  const refund = await stripe.refunds.create({
    amount: cents*100,
    payment_intent: pi,
  });
  return refund;
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
module.exports = payment;