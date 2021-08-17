const AWS = require('aws-sdk');
const TableName = "CouponTable";
const Uuid = require('uuid');
const shortid = require('shortid');
const coupon = require('../../controllers/shopping/coupon/coupon');
const { UpdateItem, RetriveItem, AddItem, DeleteItem, RetriveByQuery } = require('../db_utils');
const documentClient = new AWS.DynamoDB.DocumentClient();

const getCouponById = async (coupon_code, client_id) => {
    return await RetriveItem({ coupon_code, client_id }, TableName)
    // // if (!coupon_code) throw { message: 'Please provide Coupon Id' };
    // // var params = {
    // //     TableName,
    // //     Key: {
    // //         coupon_code,
    // //         client_id
    // //     }
    // // };
    // // const res = await documentClient.get(params).promise();
    // return res.Item;
};


const deleteCoupon = async (coupon_code, client_id) => {
    return await DeleteItem({ coupon_code, client_id }, TableName)
    // if (!coupon_code) throw { message: 'Please provide Coupon Id' };

    // var params = {
    //     TableName,
    //     Key: {
    //         coupon_code: coupon_code,
    //         client_id: client_id
    //     }

    // };
    // console.log(params);

    // console.log("Attempting a conditional delete...");
    // const res = await documentClient.delete(params).promise();
    // // const res = await documentClient.get(params).promise();
    // return res;
};


const addCoupon = async (data) => {
    data.coupon_id = Uuid.v4();
    if (data.coupon_code.length < 3) {
        data.coupon_code = shortid.generate()
    }
    try {
        return await AddItem(TableName, data)
    } catch (error) {
        console.log(error);
        throw { message: error }

    }

}

const updateCoupon = async (data) => {
    return await UpdateItem(['coupon_code', 'client_id'], TableName, data)
}

const setActive = async (coupon_id, value) => {
    const params = {
        TableName,
        Key: {
            coupon_id
        },
        ConditionExpression: 'attribute_exists(coupon_id)',
        UpdateExpression: 'set is_active = :v',
        ExpressionAttributeValues: {
            ':v': value
        },
        ReturnValues: 'ALL_NEW'
    };
    const res = await documentClient.update(params).promise();
    return res;
}

const getAllCoupon = async (client_id) => {
    const params = {
        TableName,
        KeyConditionExpression: "#ci = :client_id",
        ExpressionAttributeNames: {
            "#ci": "client_id"
        },
        ExpressionAttributeValues: {
            ":client_id": client_id
        }
    };
    const res = await documentClient.query(params).promise();
    return res;
}

const getAllSubCoupon = async (client_id, coupon_id) => {
    console.log(coupon_id);
    const params = {
        TableName,
        KeyConditionExpression: "#ci = :client_id",
        FilterExpression: "is_parent = :is_parent AND parent = :parent",
        ExpressionAttributeNames: {
            "#ci": "client_id"
        },
        ExpressionAttributeValues: {
            ":client_id": client_id,
            ":is_parent": false,
            ":parent": coupon_id
        }
    };
    const res = await documentClient.query(params).promise();
    return res['Items'];
}

module.exports = {
    addCoupon,
    getAllCoupon,
    updateCoupon,
    getCouponById,
    deleteCoupon,
    setActive,
    getAllSubCoupon
};