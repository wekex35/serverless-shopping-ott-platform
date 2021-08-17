const AWS = require('aws-sdk');
const TableName = "UserTable";
const { v4: uuidv4 } = require('uuid');
const { Payment } = require('../controllers/payment/payment')
const documentClient = new AWS.DynamoDB.DocumentClient();

const requiredProperties = ['email', 'user_name'];//, 'role'
const validateUser = (user) => requiredProperties.every(key => Object.keys(user).includes(key));



const getUserByEmail = async (req) => {
    var email = req.email;
    var client_id = req.client_id;

    if (!email || !client_id) throw { message: 'Please provide Email and Client Id' };
    var params = {
        TableName,
        Key: {
            email,
            client_id
        }
    };
    const res = await documentClient.get(params).promise();
    return res.Item;
};

const getAllUsers = async (filters = [], limit = 50) => {

};

const registerUser = async (user) => {
    console.log("user ==>");
    var d = await getUserByEmail(user);
    if (d) throw `This email address is already registered with us. Please choose another email`
    const params = {
        TableName,
        Item: user,
    };
    const res = await documentClient.put(params).promise();
    return res;
};

const suspendUsers = async (req) => {
    const emails = JSON.parse(req.body);
    const client_id = req.headers.client_id
    if (!emails || emails.length <= 0) throw { message: 'Please provide valid emails' };
    emails.forEach(async (email, index) => {
        const params = {
            TableName,
            Key: {
                email,
                client_id
            },
            ConditionExpression: 'attribute_exists(email)',
            UpdateExpression: 'ADD isSuspended :v',
            ExpressionAttributeValues: {
                ':v': true
            },
            ReturnValues: 'ALL_NEW'
        };
        const res = await documentClient.update(params).promise();
    });

    return true;

};

const updateUser = async (user) => {
    if (!user) throw { message: 'Please provide valid user with User ID' };
    if (!user.email) throw { message: 'Please provide valid User ID' };
    throw { message: 'This feature is not implemented yet' };
    // const params = {
    //     TableName,
    //     Item: user,
    // };
    // const res = await documentClient.put(params).promise();
    // return res;
};

const setPassword = async (password, email) => {
    if (!password || !email) throw { message: 'Please provide new password of user with User ID' };
    const params = {
        TableName,
        Key: {
            email
        },
        ConditionExpression: 'attribute_exists(email)',
        UpdateExpression: 'set password = :v',
        ExpressionAttributeValues: {
            ':v': password
        },
        ReturnValues: 'ALL_NEW'
    };
    const res = await documentClient.update(params).promise();
    return res;

};

const setOTPForUser = async (otp, email) => {
    if (!otp || !email) throw { message: 'Parameters not correct' };

    const params = {
        TableName,
        Key: {
            email
        },
        ConditionExpression: 'attribute_exists(email)',
        UpdateExpression: 'ADD otp :v',
        ExpressionAttributeValues: {
            ':v': otp
        },
        ReturnValues: 'ALL_NEW'
    };
    const res = await documentClient.update(params).promise();
    return res;
};

const addUserSubscription = async (subsData) => {
    if (!subsData) throw { message: 'Parameters not correct' };
    const { email, client_id, subs } = subsData;
    subs.uuid = uuidv4();
    subs.status = "active";
    const params = {
        TableName,
        Key: {
            email,
            client_id
        },
        ConditionExpression: 'attribute_exists(email)',
        UpdateExpression: 'set #subscriptions = list_append(if_not_exists(#subscriptions, :empty_list), :subs)',
        ExpressionAttributeNames: {
            '#subscriptions': 'subscriptions'
        },
        ExpressionAttributeValues: {
            ':subs': [subs],
            ':empty_list': []
        },
        ReturnValues: 'ALL_NEW'
    };
    const res = await documentClient.update(params).promise();
    //////////////////////////// Dump data to the Elastic Search /////////////////////////

    subs.email = email;
    subs.client_id = client_id;

    ///dump subs to elastic search engine
    ///Code Space for elastic search/// 


    //////////////////////////////////////////////////////////////////////////////////////
    return res;
};

const cancelSubscription = async (email, client_id, subs_uuid) => {
    const  subsList = (await getUserByEmail({email,client_id})).subscriptions;
    const cancelAbleSubscription = subsList.find( ({ uuid,subs_status }) => (uuid === subs_uuid && subs_status == "active"));
    if(!cancelAbleSubscription) throw "Active Subscription not found";
   
    const index = subsList.indexOf(cancelAbleSubscription);
    const params = {
        TableName,
        Key: {
            email,
            client_id
        },
        ConditionExpression: 'attribute_exists(email)',
        UpdateExpression: 'set subscriptions[' + index + '].subs_status = :v',
        ExpressionAttributeValues: {
            ':v': "cancelled"
        },
        ReturnValues: 'ALL_NEW'
    };
    const res = await documentClient.update(params).promise();
    return res;
}

const upgradeSubscription = async (email, client_id, subs_uuid) => {
    const  subsList = (await getUserByEmail({email,client_id})).subscriptions;
    const cancelAbleSubscription = subsList.find( ({ uuid,subs_status }) => uuid === subs_uuid && subs_status == "active" );
    if(cancelAbleSubscription) throw "Active Subscription not found";
    const index = subsList.indexOf(cancelAbleSubscription);
    const params = {
        TableName,
        Key: {
            email,
            client_id
        },
        ConditionExpression: 'attribute_exists(email)',
        UpdateExpression: 'set subscriptions[' + index + '].subs_status = :v',
        ExpressionAttributeValues: {
            ':v': "cancelled"
        },
        ReturnValues: 'ALL_NEW'
    };
    const res = await documentClient.update(params).promise();
    return res;
}

module.exports = {
    registerUser,
    suspendUsers,
    updateUser,
    getAllUsers,
    getUserByEmail,
    validateUser,
    setPassword,
    setOTPForUser,
    addUserSubscription,
    cancelSubscription,
    requiredProperties
};
