'use strict';

const subscription = require('./app/controllers/subscription/subscription');
const user = require('./app/controllers/user/user');
const authorize = require('./app/controllers/auth/authorize');
const payment = require('./app/controllers/payment/payment');
const category = require('./app/controllers/shopping/category/category');
const product = require('./app/controllers/shopping/product/product');
const cartItem = require('./app/controllers/shopping/cartItem/cartItem');
const placeOrder = require('./app/controllers/shopping/placeOrder/placeOrder');
const coupon = require('./app/controllers/shopping/coupon/coupon');


// Subscription
module.exports.getSubscriptions = async (event, req, callback) => {  
  await subscription.getSubscriptions(callback, event);
};

module.exports.addSubscription = async (event, req, callback) => {  
  await subscription.addSubscription(callback, event);

};
module.exports.updateSubscription = async (event, req, callback) => {  
  await subscription.updateSubscription(callback, event);
};

module.exports.buySubscription = async (event, req, callback) => {
  await authorize(callback, event);
  await subscription.buySubscription(callback, event);
};

module.exports.cancelSubscription = async (event, req, callback) => {
  await authorize(callback, event);
  await subscription.cancelSubscription(callback, event);
};

module.exports.upgradeSubscription = async (event, req, callback) => {
  await authorize(callback, event);
  await subscription.upgradeSubscription(callback, event);
};

// Users
module.exports.registerUser = async (event, req, callback) => user.registerUser(callback, event);
module.exports.forgotPassword = async (event, req, callback) => user.forgotPassword(callback, event);
module.exports.verifyOtpSetPassword = async (event, req, callback) => user.verifyOtpSetPassword(callback, event);


module.exports.getAllUsers = async (event, req, callback) => {
     await authorize(callback, event);
    await user.getAllUsers(callback, event);
};

module.exports.getUserDetails = async (event, req, callback) => {
    await authorize(callback, event);
    await user.getUserDetails(callback, event);
};

module.exports.disableUser = async (event, req, callback) => {
     await authorize(callback, event);
    await user.disableUser(callback, event);
};

module.exports.updateUser = async (event, req, callback) => {
     await authorize(callback, event);
    await user.updateUser(callback, event);
};

module.exports.changePassword = async (event, req, callback) => {
     await authorize(callback, event);
    await user.changePassword(callback, event);
};


//Payment and Transaction
//Stripe Payment
module.exports.createStripePaymentIntent = async (event, req, callback) => {
  await authorize(callback, event);
  await payment.createStripePaymentIntent(callback, event);
};

module.exports.stripePaymentWebHook = async (event, req, callback) => {
  // await authorize(callback, event);
 await payment.stripePaymentWebHook(callback, event);
};

//Paypal Payment
module.exports.createPaypalPaymentIntent = async (event, req, callback) => {
  await authorize(callback, event);
  await payment.createPaypalPaymentIntent(callback, event);
};

module.exports.paypalPaymentWebHook = async (event, req, callback) => {
  // await authorize(callback, event);
 await payment.paypalPaymentWebHook(callback, event);
};

module.exports.refundPayment = async (event, req, callback) => {
  // await authorize(callback, event);
 await payment.refundPayment(callback, event);
};

// =============== Shopping =================

//Product
module.exports.getAllProduct = async (event, req, callback) => {  
  await product.getAllProduct(callback, event);
};

module.exports.addProduct = async (event, req, callback) => {  
  await product.addProduct(callback, event);
};

module.exports.updateProduct = async (event, req, callback) => {  
  await product.updateProduct(callback, event);
};

module.exports.deleteProduct = async (event, req, callback) => {  
  await product.deleteProduct(callback, event);
};

module.exports.getShoppingHomeScreen = async (event, req, callback) => {  
  await product.getShoppingHomeScreen(callback, event);
};

module.exports.viewAllProduct = async (event, req, callback) => {  
  await product.viewAllProduct(callback, event);
};

module.exports.getRelatedProduct = async (event, req, callback) => {  
  await product.getRelatedProduct(callback, event);
};

module.exports.getProductById = async (event, req, callback) => {  
  await product.getProductById(callback, event);
};





//Category
module.exports.getAllCategory = async (event, req, callback) => {  
  await category.getAllCategory(callback, event);
};

module.exports.addCategory = async (event, req, callback) => {  
  await category.addCategory(callback, event);
};

module.exports.updateCategory = async (event, req, callback) => {  
  await category.updateCategory(callback, event);
};

module.exports.deleteCategory = async (event, req, callback) => {  
  await category.deleteCategory(callback, event);
};

//Coupon
module.exports.getAllCoupon = async (event, req, callback) => {  
  await coupon.getAllCoupon(callback, event);
};

module.exports.addCoupon = async (event, req, callback) => {  
  await coupon.addCoupon(callback, event);
};

module.exports.updateCoupon = async (event, req, callback) => {  
  await coupon.updateCoupon(callback, event);
};

module.exports.deleteCoupon = async (event, req, callback) => {  
  await coupon.deleteCoupon(callback, event);
};

module.exports.verifyCoupon = async (event, req, callback) => {  
  await coupon.verifyCoupon(callback, event);
};


//CartItem
module.exports.getAllCartItem = async (event, req, callback) => {  
  await cartItem.getAllCartItem(callback, event);
};

module.exports.addCartItem = async (event, req, callback) => {  
  await cartItem.addCartItem(callback, event);
};

module.exports.updateCartItem = async (event, req, callback) => {  
  await cartItem.updateCartItem(callback, event);
};

module.exports.deleteCartItem = async (event, req, callback) => {  
  await cartItem.deleteCartItem(callback, event);
};


//Order
module.exports.getOrderHistory = async (event,req, callback) => {  
  await placeOrder.getAllPlaceOrder(callback, event);
};

module.exports.placeOrder = async (event,req, callback) => {
  await placeOrder.placeOrder(callback, event);
};

module.exports.updateOrderStatus = async (event,req, callback) => {  
  await placeOrder.updateOrderStatus(callback, event);
};

module.exports.deleteOrder = async (event,req, callback) => {  
  await placeOrder.deleteOrder(callback, event);
};

module.exports.orderPaymentIntent = async (event,req, callback) => {    
  await placeOrder.orderPaymentIntent(callback, event);
};


////////////////// Video ////////////////////

module.exports.getAllVideoCategory = async (event, req, callback) => {  
  await category.getAllVideoCategory(callback, event);
};

module.exports.addVideoCategory = async (event, req, callback) => {  
  await category.addVideoCategory(callback, event);
};

module.exports.updateVideoCategory = async (event, req, callback) => {  
  await category.updateVideoCategory(callback, event);
};

module.exports.deleteVideoCategory = async (event, req, callback) => {  
  await category.deleteVideoCategory(callback, event);
};

//Video
module.exports.getAllVideo = async (event, req, callback) => {  
  await product.getAllVideo(callback, event);
};

module.exports.addVideo = async (event, req, callback) => {  
  await product.addVideo(callback, event);
};

module.exports.updateVideo = async (event, req, callback) => {  
  await product.updateVideo(callback, event);
};

module.exports.deleteVideo = async (event, req, callback) => {  
  await product.deleteVideo(callback, event);
};

module.exports.getVideoScreen = async (event, req, callback) => {  
  await product.getVideoScreen(callback, event);
};

module.exports.viewAllVideo = async (event, req, callback) => {  
  await product.viewAllVideo(callback, event);
};

module.exports.getRelatedVideo = async (event, req, callback) => {  
  await product.getRelatedVideo(callback, event);
};

module.exports.getVideoById = async (event, req, callback) => {  
  await product.getVideoById(callback, event);
};