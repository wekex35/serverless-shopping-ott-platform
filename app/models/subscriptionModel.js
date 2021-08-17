const AWS = require('aws-sdk');
const TableName = "SubscriptionTable";
const documentClient = new AWS.DynamoDB.DocumentClient();
const User = require('./userModel');
const Transaction = require('./transactionModel');

const addSubscription = async (data) => {
    const params = {
        TableName,
        Item: data,
    };
    const res = await documentClient.put(params).promise();  
    return res;
}

const updateSubscription = async (data) => {
    const params = {
        TableName,
        Item: data,
    };
    const res = await documentClient.put(params).promise();  
    return res;
}

const getSubscriptionByCode = async (code,client_id) => {
    if (!code || !client_id) throw { message: 'Please provide Subscription Code and Client Id' };
    var params = {
        TableName,
        Key: {
            code,
            client_id
        }
    };
    const res = await documentClient.get(params).promise();    
    return res.Item;
};

const buySubscription = async (requestBody) => {
    const {transaction_id, email} = requestBody;
    const transInfo = await Transaction.getTransactionById(transaction_id)
    if(transInfo != undefined){
        if(transInfo.payment_status != "succeeded") throw "Payment is under process"
        if(!transInfo.is_active) throw `Transaction is used by  ${transInfo.email}`
        
        //Read subscription details
        const subs = await getSubscriptionByCode(transInfo.subscription_code,requestBody.client_id);
        if(!subs) throw `Subscription not found`
        const date = new Date(0);
        var end_date = new Date(0);
        end_date.setDate(date.getDate() + 30);
        subs.start_date = date.toISOString();
        subs.end_date = end_date.toISOString();
        
        //Adding subscription to user account
        const subsData = {email}
        subsData.client_id = requestBody.client_id;   
        subsData.subs = subs;    
        subs.transaction_id = transaction_id;
        console.log(subsData);
        const addSubs = await User.addUserSubscription(subsData);
        if(!addSubs) throw `Subscription Failed`
        Transaction.setActive(transaction_id,false)
        return addSubs;
    }
  
    return null;
}

const getAllSubscription = async () => {
    const params = {
        TableName,           
    };
    const res = await documentClient.scan(params).promise();   
    return res['Items'];
}

const cancelSubscription = async (event) => {
    const client_id = event.headers.client_id;
    const email = event.user.email;
    const uuid = event.uuid;
    const res = await User.cancelSubscription(email,client_id,uuid);
    if(!res) throw `Cancelling Failed`
    return res;
}

const upgradeSubscription = async (requestBody) => {
    const {transaction_id, email} = requestBody;
    const transInfo = await Transaction.getTransactionById(transaction_id)
    if(transInfo != undefined){
        if(transInfo.payment_status != "succeeded") throw "Payment is under process"
        if(!transInfo.is_active) throw `Transaction is used by  ${transInfo.email}`
        
        //Read subscription details
        const subs = await getSubscriptionByCode(transInfo.subscription_code);
        if(!subs) throw `Subscription not found`
        const date = new Date(0);
        var end_date = new Date(0);
        end_date.setDate(date.getDate() + 30);
        subs.start_date = date.toISOString();
        subs.end_date = end_date.toISOString();
        
        //Adding subscription to user account
        const addSubs = await User.addUserSubscription(subs,email);
        if(!addSubs) throw `Subscription Failed`
        Transaction.setActive(transaction_id,false)
        return addSubs;
    }
  
    return null;
}





module.exports = {
    addSubscription,
    getAllSubscription,
    updateSubscription,
    buySubscription,
    getSubscriptionByCode,
    cancelSubscription,
    upgradeSubscription
};