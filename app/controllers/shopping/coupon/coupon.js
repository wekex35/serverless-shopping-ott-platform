const Coupon = require('../../../models/shopping/couponModels')

/* 
Routes 
/coupons get
/coupons post add coupons
/buycoupon
*/
//to retrive all coupons
const coupon = {};
coupon.getAllCoupon = async (callback, event) => {
    
    try {
        let client_id = event.queryStringParameters.client_id
        const newSubs = await Coupon.getAllCoupon(client_id);
        sendResponse(callback, 200, 'Coupon List', newSubs);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}



//to add coupons
coupon.addCoupon = async (callback, event) => {
    const requestBody = JSON.parse(event.body);
    if (!requestBody) sendResponse(callback, 400, 'Coupon object not found', null)
    try {
        if (!requestBody.client_id) requestBody.client_id = event.headers.client_id;
        const newSubs = await Coupon.addCoupon(requestBody);
        if (!newSubs) {
            sendResponse(callback, 400, 'Error in Adding New Coupon', null);
        }
        sendResponse(callback, 200, 'Coupon Added', newSubs);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}

//to Update coupons
coupon.updateCoupon = async (callback, event) => {
    const requestBody = JSON.parse(event.body);
    if (!requestBody) sendResponse(callback, 400, 'Coupon object not found', null)
    try {
        if (!requestBody.client_id) requestBody.client_id = event.headers.client_id;
        const newSubs = await Coupon.updateCoupon(requestBody);
        if (!newSubs) {
            sendResponse(callback, 400, 'Error in Adding New Coupon', null);
        }
        sendResponse(callback, 200, 'Coupon Updated', null);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}

//to delete coupons
coupon.deleteCoupon = async (callback, event) => {
    const requestBody = JSON.parse(event.body);
    var coupon_code = requestBody.coupon_code;
    var client_id = requestBody.client_id;
    if (!coupon_code) sendResponse(callback, 400, 'Coupon Id Not found', null)
    try {

        const res = await Coupon.deleteCoupon(coupon_code,client_id);
        console.log(res);
        if (!res) {
            sendResponse(callback, 400, 'Coupon Purchase Failed', null);
        }
        sendResponse(callback, 200, 'Coupon Deleted', null);
    } catch (error) {

        sendResponse(callback, 400, error.message || error, null)
    }
}

//to delete coupons
coupon.verifyCoupon = async (callback, event) => {
    const requestBody = JSON.parse(event.body);
    var coupon_code = requestBody.coupon_code;
    var client_id = requestBody.client_id;
    if (!coupon_code) sendResponse(callback, 400, 'Coupon Id Not found', null)
    try {
        const res = await Coupon.getCouponById(coupon_code,client_id);
        console.log(res);
        if (!res) {
            sendResponse(callback, 400, 'Invalid Coupon', null);
        }
        var toDay = new Date();
        var isValid = dateCheck(res.start_date,res.end_date,`${toDay.getFullYear()}/${toDay.getMonth()+1}/${toDay.getDate()}`);//new Date(res.start_date).getMilliseconds() <= new Date().getDate();
        if (!isValid) {
            sendResponse(callback, 200, 'Coupon Validation', {"valid":isValid});
        }
        sendResponse(callback, 200, 'Coupon Validation', {"valid":isValid});
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null)
    }
}

function dateCheck(from,to,check) {
    console.log(from);
    console.log(to);
    console.log(check);
    var fDate,lDate,cDate;
    fDate = Date.parse(from);
    lDate = Date.parse(to);
    cDate = Date.parse(check);

    if((cDate <= lDate && cDate >= fDate)) {
        return true;
    }
    return false;
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

module.exports = coupon;