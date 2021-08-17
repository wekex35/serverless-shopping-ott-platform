const AWS = require('aws-sdk');
const TableName = "MusicTable";
const Uuid = require('uuid')
const documentClient = new AWS.DynamoDB.DocumentClient();


const getMusicById = async (client_id,music_id) => {
    
    if (!client_id || !music_id) throw { message: 'Client or Music Id is Missing' };
    const params = {
        TableName,
        KeyConditionExpression: "#ui = :client_id AND #music_id = :music_id",
        ExpressionAttributeNames: {
            "#ui": "client_id",
            "#music_id": "music_id"
        },
        ExpressionAttributeValues: {
            ":client_id": client_id,
            ":music_id": music_id
        }
    };
    const res = await documentClient.query(params).promise();
    return res['Items'][0];
   
};

const deleteMusic = async (music_id, client_id) => {
    if (!music_id) throw { message: 'Please provide Music Id' };
    var params = {
        TableName,
        Key: {
            music_id: music_id,
            client_id: client_id
        },
        ReturnValues: 'ALL_OLD'

    };
    console.log(params);

    console.log("Attempting a conditional delete...");
    const res = await documentClient.delete(params).promise();
    // const res = await documentClient.get(params).promise();
    return res;
};

const addMusic = async (data) => {

    data.music_id = Uuid.v4();
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

const updateMusic = async (data) => {
    console.log(data);

    const params = {
        TableName,
        Key: {
            "music_id": data.music_id,
            "client_id": data.client_id
        },
        UpdateExpression: `set 
        title = :title,
        description = :description,
        images = :images,
        stock = :stock,
        size = :size,
        is_active = :is_active,
        price = :price,
        discount = :discount,
        is_featured = :is_featured,
        category = :category,
        subcategory = :subcategory,
        brand = :brand`,

        ExpressionAttributeValues: {
            ':title': data.title,
            ':description': data.description,
            ':images': data.images,
            ':stock': data.stock,
            ':size': data.size,
            ':is_active': data.is_active,
            ':price': data.price,
            ':discount': data.discount,
            ':is_featured': data.is_featured,
            ':category': data.category,
            ':subcategory': data.subcategory,
            ':brand': data.brand
        },
        ReturnValues: 'ALL_NEW'
    };
    console.log(params);

    const res = await documentClient.update(params).promise();
    return res;
}

const setActive = async (trans_id, value) => {
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

// const getMusicByCategories = async (client_id) => {
//     const params = {
//         TableName,
//         KeyConditionExpression: "#ci = :client_id",
//         ExpressionAttributeNames: {
//             "#ci": "client_id",
//         },
//         ExpressionAttributeValues: {
//             ":client_id": client_id
//         }
//     };
//     const res = await documentClient.query(params).promise();
//     return res['Items'];
// }

const getAllMusic = async (client_id) => {
    const params = {
        TableName,
        KeyConditionExpression: "#ci = :client_id",
        // FilterExpression : "category.category_id = :title",
        ExpressionAttributeNames: {
            "#ci": "client_id"
        },
        ExpressionAttributeValues: {
            ":client_id": client_id,
            // ":title":"a599ad3c-bfa9-40ea-8889-1c53d4fb8dc9"
            // ":category": "a599ad3c-bfa9-40ea-8889-1c53d4fb8dc9"
        }
    };
    const res = await documentClient.query(params).promise();
    return res['Items'];
}

const getMusicByCategory = async (client_id,category_id) => {
  
    const params = {
        TableName,
        KeyConditionExpression: "#ci = :client_id",
        FilterExpression : "category.category_id = :category_id",
        ExpressionAttributeNames: {
            "#ci": "client_id"
        },
        ExpressionAttributeValues: {
            ":client_id": client_id,
            ":category_id" : category_id
            // ":title":"a599ad3c-bfa9-40ea-8889-1c53d4fb8dc9"
            // ":category_id" : "26e28198-b7ac-4cfb-9260-0c6690b61184"
        }
    };
    const res = await documentClient.query(params).promise();
    return res['Items'];
}

const getMusicBySubCategory = async (client_id,category_id) => {
  
    const params = {
        TableName,
        KeyConditionExpression: "#ci = :client_id",
        FilterExpression : "subcategory.category_id = :category_id",
        ExpressionAttributeNames: {
            "#ci": "client_id"
        },
        ExpressionAttributeValues: {
            ":client_id": client_id,
            ":category_id" : category_id
            // ":title":"a599ad3c-bfa9-40ea-8889-1c53d4fb8dc9"
            // ":category_id" : "26e28198-b7ac-4cfb-9260-0c6690b61184"
        }
    };
    const res = await documentClient.query(params).promise();
    return res['Items'];
}

module.exports = {
    addMusic,
    getAllMusic,
    updateMusic,
    getMusicById,
    deleteMusic,
    setActive,
    getMusicByCategory,
    getMusicBySubCategory 
};