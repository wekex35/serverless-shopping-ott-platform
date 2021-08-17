const AWS = require('aws-sdk');
const TableName = "CartItemTable";
const Uuid = require('uuid')
const documentClient = new AWS.DynamoDB.DocumentClient();
const Product = require('./productModel')

const getCartItemById = async (trans_id) => {
    if (!trans_id) throw { message: 'Please provide CartItem Id' };
    var params = {
        TableName,
        Key: {
            trans_id
        }
    };
    const res = await documentClient.get(params).promise();
    return res.Item;
};


const deleteCartItem = async (product_id, user_id) => {
    if (!product_id) throw { message: 'Please provide Product Id' };


    var params = {
        TableName,
        Key: {
            product_id: product_id,
            user_id: user_id
        },
        ReturnValues: 'ALL_OLD'
    };
    console.log(params);

    console.log("Attempting a conditional delete...");
    const res = await documentClient.delete(params).promise();
    // const res = await documentClient.get(params).promise();
    return res;
};


const addCartItem = async (data) => {
    var exits = await itemExits(data.user_id, data.product_id);
    if (exits.Count == 0) {
        data.cart_id = Uuid.v4();
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
    } else {
        return updateCartItem(data);
    }
}

const itemExits = async (user_id, product_id) => {
    const params = {
        TableName,
        KeyConditionExpression: "#ui = :user_id AND #product_id = :product_id",
        ExpressionAttributeNames: {
            "#ui": "user_id",
            "#product_id": "product_id"
        },
        ExpressionAttributeValues: {
            ":user_id": user_id,
            ":product_id": product_id
        }
    };
    const res = await documentClient.query(params).promise();

    return res;
}

const updateCartItem = async (data) => {
    console.log(data);

    const params = {
        TableName,
        Key: {
            "user_id": data.user_id,
            "product_id": data.product_id
        },
        UpdateExpression: 'set quantity =quantity + :quantity',
        ExpressionAttributeValues: {
            ':quantity': data.quantity
        },
        ReturnValues: 'ALL_NEW'
    };
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

const getAllCartItem = async (user_id) => {
    const params = {
        TableName,
        KeyConditionExpression: "#ui = :user_id",
        ExpressionAttributeNames: {
            "#ui": "user_id"
        },
        ExpressionAttributeValues: {
            ":user_id": user_id
        }
    };
    const res = await documentClient.query(params).promise();
    var resData = [];
    for (let index = 0; index < res['Count']; index++) {
        const element = res['Items'][index];
        var products = await Product.getProductById(element.client_id, element.product_id)
        if (products) {
            products['quantity'] = element.quantity;
            console.log(products);
            resData.push(products)
        }
    }
    return resData;
}

module.exports = {
    addCartItem,
    getAllCartItem,
    updateCartItem,
    getCartItemById,
    deleteCartItem,
    setActive
};