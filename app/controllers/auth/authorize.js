const jsonwebtoken = require('jsonwebtoken');
const { promisify } = require('util');
const routes = require('./routes');
const Env = require('../../../env');
module.exports = async(callback, req) => {
    try {
        var token = req.headers['Authorization'];
       
        if(!token){
          token = req.headers.authorization;}
        if (!token) sendResponse(callback, 400, 'Invalid Request. No auth token found in request', null)
        token = token.replace('Bearer ', '');
        const claim = await verifyToken(token);      
        if (!claim) {
            sendResponse(callback, 400, 'Unauthorized', null)
        }

        const isAllowed = authorizeUser(claim.scopes, req.resource.split("?").shift());
        if (isAllowed) {
            req.user = claim;
            return req;
        }
        sendResponse(callback, 400, 'Not authorized Route', null)
    } catch (error) {
        sendResponse(callback, 400, 'Error in authorizer '+error, null)
        // console.log('Error in authorizer', error)
        // throw error;
    }
};


const authorizeUser = (userScopes, methodArn) => {
    const methodScope = [];
    routes.forEach(scopeObj => {
        if (scopeObj.routes.some(r => methodArn.endsWith(r))) {
            methodScope.push(scopeObj.scope);
        }
    });
    const hasValidScope = userScopes.filter(scope => methodScope.includes(scope));
    return hasValidScope.length > 0;
};

const verifyToken = async(token) => {
    const verifyPromised = promisify(jsonwebtoken.verify.bind(jsonwebtoken));
    try {

        const claim = await verifyPromised(token, Env.JWT_SECRET);
        const currentSeconds = Math.floor((new Date()).valueOf() / 1000);
        if (currentSeconds > claim.exp || currentSeconds < claim.auth_time) {
            throw new Error('Claim is expired or invalid');
        }
        
        return claim;
    } catch (error) {
        console.log(error);
        return false;
    }
};

function sendResponse(callback, status, message, data) {
    var res = {
        statusCode: status,
        headers: {
            'Access-Control-Allow-Origin': '*', // Required for CORS support to work
            'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
            'Content-Type': 'application/json'
        },
        body:  JSON.stringify({
            data: data,
            message: message,
            status: status
        })
    };

    callback(null,res);
}