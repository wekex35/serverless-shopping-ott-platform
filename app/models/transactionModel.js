const AWS = require('aws-sdk');
const TableName = "TransactionTable";
const documentClient = new AWS.DynamoDB.DocumentClient();

const getTransactionById = async (trans_id) => {
    if (!trans_id) throw { message: 'Please provide Transaction Id' };
    var params = {
        TableName,
        Key: {
            trans_id
        }
    };
    const res = await documentClient.get(params).promise();
    return res.Item;
};

const addTransaction = async (data) => {
    console.log(data);
    const params = {
        TableName,
        Item: data,
    };
    try {
        const res = await documentClient.put(params).promise();
        return res;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const updateTransactionStatus = async (trans_id,pay_status) => {
    
    const params = {
        TableName,
        Key: {
            trans_id
        },
        UpdateExpression: 'set payment_status = :v',
        ExpressionAttributeValues: {
            ':v': pay_status
        },
        ReturnValues: 'ALL_NEW'
    };
        const res = await documentClient.update(params).promise();
        return res;
}

const setActive  = async (trans_id,value) => {
    const params = {
        TableName,
        Key: {
            trans_id
        },
        ConditionExpression: 'attribute_exists(trans_id)',
        UpdateExpression: 'set is_active = :v',
        ExpressionAttributeValues: {
            ':v': value
        },
        ReturnValues: 'ALL_NEW'
    };
        const res = await documentClient.update(params).promise();
        return res;
}

const getAllTransaction = async () => {
    const params = {
        TableName,
    };
    const res = await documentClient.scan(params).promise();
    return res['Items'];
}

module.exports = {
    addTransaction,
    getAllTransaction,
    updateTransactionStatus,
    getTransactionById,
    setActive
};