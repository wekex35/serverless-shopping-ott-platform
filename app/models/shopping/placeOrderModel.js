const AWS = require('aws-sdk');
const TableName = "ShoppingOrderTable";
const Uuid = require('uuid')
const documentClient = new AWS.DynamoDB.DocumentClient();
const Product = require('./productModel');
const transactionModel = require('./../transactionModel');
const cartItemModel = require('./cartItemModel');

const getOrderInfoById = async (trans_id) => {
    if (!trans_id) throw { message: 'Please provide PlaceOrder Id' };
    var params = {
        TableName,
        Key: {
            trans_id
        }
    };
    const res = await documentClient.get(params).promise();
    return res.Item;
};


const deleteOrder = async (product_id, user_id) => {
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


const placeOrder = async (data) => {
    // data.payment_id
    var transDetails = await transactionModel.getTransactionById(data.payment_id);
    if (!transDetails) throw { message: "Invalid Transaction Id" }

    if (transDetails.is_active /* && transDetails.payment_status == "succeeded"*/) {
        data.item_details = [];
        for (let index = 0; index < data.items.length; index++) {
            const element = data.items[index];
            var product = await Product.getProductById(data.client_id, element.product_id)
            data.item_details.push(product)
        }
        data.order_id = Uuid.v4();
        data.order_status = "placed"
        const params = {
            TableName,
            Item: data,
        };
        try {
            const res = await documentClient.put(params).promise();   
            if(res){
                transactionModel.setActive(data.payment_id,false)
                if(data.is_cart){
                    for (let index = 0; index < data.items.length; index++) {
                        const element = data.items[index];
                        await  cartItemModel.deleteCartItem(element.product_id,data.user_id)
                        data.item_details.push(product)
                    }                   
                }               
            }
            return res;
        } catch (error) {
            console.log(error);
            return false;
        }
    } else {
        throw { message: "Invalid Transaction Id" }
    }

    // Product.getProductById(data.client_id,)


    //     data.uuid = Uuid.v4();
    //     console.log(data);
    //     const params = {
    //         TableName,
    //         Item: data,
    //     };
    //     try {
    //         const res = await documentClient.put(params).promise();
    //         return res;
    //     } catch (error) {
    //         console.log(error);
    //         return false;
    //     }

}

const orderExits = async (user_id, product_id) => {
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

const updateOrderStatus = async (data) => {
    console.log(data);

const params = {
        TableName,
        Key: {
            "user_id": data.user_id,
            "order_id": data.order_id
        },
        UpdateExpression: 'set order_status = :order_status',
        ExpressionAttributeValues: {
            ':order_status': data.order_status
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

const getOrderHistory = async (user_id) => {
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
    
    return res;
}

module.exports = {
    getOrderInfoById,
    deleteOrder,
    placeOrder,
    orderExits,
    updateOrderStatus,
    setActive,
    getOrderHistory
};