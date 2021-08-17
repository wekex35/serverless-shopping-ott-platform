const AWS = require('aws-sdk');
const TableName = "MusicCategoryTable";
const Uuid = require('uuid')
const documentClient = new AWS.DynamoDB.DocumentClient();

const getMusicCategoryById = async (trans_id) => {
    if (!trans_id) throw { message: 'Please provide Music Category Id' };
    var params = {
        TableName,
        Key: {
            trans_id
        }
    };
    const res = await documentClient.get(params).promise();
    return res.Item;
};


const deleteMusicCategory = async (category_id,client_id) => {
    if (!category_id) throw { message: 'Please provide Music Category Id' };   
    
    var params = {
        TableName,   
        Key: {
            category_id : category_id,
            client_id : client_id
        }  
      
    };
    console.log(params);
    
    console.log("Attempting a conditional delete...");
    const res = await documentClient.delete(params).promise();
    // const res = await documentClient.get(params).promise();
    return res;
};


const addMusicCategory = async (data) => {
    data.category_id = Uuid.v4();
    const params = {
        TableName,
        Item: data,
        ReturnValues: 'ALL_OLD'
    };
    try {
        const res = await documentClient.put(params).promise();
        return res;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const updateMusicCategory = async (data) => {
    console.log(data);

    const params = {
        TableName,
        Key: {
            "category_id" : data.category_id,
            "client_id" : data.client_id
        },
        UpdateExpression: 'set title = :title,photo = :photo,is_parent = :is_parent,parent = :parent,added_by = :added_by,is_active = :is_active',
        ExpressionAttributeValues: {
            ':title' : data.title,
            ':photo' : data.photo,
            ':is_parent' : data.is_parent,
            ':parent' : data.parent,
            ':added_by' : data.added_by,
            ':is_active' : data.is_active
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

const getAllMusicCategory = async (client_id) => {

    const params = {
        TableName,
        KeyConditionExpression: "#ci = :client_id",
        ExpressionAttributeNames:{
            "#ci": "client_id"
        },
        ExpressionAttributeValues: {
            ":client_id": client_id
        }
    };
    const res = await documentClient.query(params).promise();
    return res['Items'];
}

const getAllSubMusicCategory = async (client_id,category_id) => {
   console.log(category_id);
    const params = {
        TableName,
        KeyConditionExpression: "#ci = :client_id",
        FilterExpression : "is_parent = :is_parent AND parent = :parent",
        ExpressionAttributeNames:{
            "#ci": "client_id"
        },
        ExpressionAttributeValues: {
            ":client_id": client_id,
            ":is_parent" : false,
            ":parent": category_id
        }
    };
    const res = await documentClient.query(params).promise();
    return res['Items'];
}

module.exports = {
    addMusicCategory,
    getAllMusicCategory,
    updateMusicCategory,
    getMusicCategoryById,
    deleteMusicCategory,
    setActive,
    getAllSubMusicCategory
};