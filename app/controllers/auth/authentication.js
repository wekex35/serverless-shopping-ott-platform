const User = require('../../models/userModel')
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const Env = require('../../../env');

exports.handler = async(event, _ ,callback) => {
    const {email,password} = JSON.parse(event.body);
    
    if (!email || !password) {       
        sendResponse(callback,400,`Could not find Email or Password.`,null);      
    }
    console.log('User', email)
    console.log('password', password)
    try {
        const client_id = event.headers.client_id;
        const user = await User.getUserByEmail({email,client_id});
        console.log('User', user)
        console.log('password', password)
        if (!user || !user.password || user.status === 'inactive') {
            throw { message: 'User not found or not activated' }
        }
        
        const compare = await bcrypt.compare(password, user.password);
        if (compare) {
            const payload = {
                email: user.email,
                scopes: [user.role]
            }
            const newToken = jsonwebtoken.sign(payload, Env.JWT_SECRET, { expiresIn: Env.JWT_EXPIRY });
            sendResponse( callback,200,'Login Successfull', { token: newToken } );             
        } else {
            sendResponse( callback,400,  'Password does not match', null ); 
        }
    } catch (error) {
        console.log('Error in authentication', error)
        sendResponse( callback,400,  error.message || error, null );        
    }
};

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