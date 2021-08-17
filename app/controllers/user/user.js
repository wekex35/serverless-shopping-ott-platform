const User = require('../../models/userModel');
const bcrypt = require('bcryptjs');
const Notification = require("../../utils/notification")
const jsonwebtoken = require('jsonwebtoken');
const Env = require('../../../env');
// const { sendEmail } = require('../messaging');

const userController = {};

userController.getAllUsers = async (callback, req) => {
    try {
        // if (req.user.scopes[0] != 'admin') {
        //     throw { message: 'Not authorized' };
        // }
        const query = req.query;
        const filters = Object.keys(query)
            .filter(key => key.toLowerCase() !== 'limit')
            .map(key => ({ type: key, value: query[key] }));

        const limit = query.limit ? query.limit : 200;
        const users = await User.getAllUsers(filters, limit);
        sendResponse(callback, 200, null, users);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null);
    }
};

userController.getUserDetails = async (callback, req) => {
    try {
        req.email = req.user.email;
        req.client_id = req.headers.client_id;
        const user = await User.getUserByEmail(req);
        if(!user)sendResponse(callback, 200, "User Not found", null);
        delete user.password;
        delete user.otp;
        sendResponse(callback, 200, "User Info", user);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null);
    }
};

userController.registerUser = async (callback, req) => {
   
    try {
        const user = JSON.parse(req.body);
      
        if (!user.role) {
        user.role = 'user';}
        if (!user.password) {
            user.password = Math.random().toString(36).substring(4);
        }
        const userValid = User.validateUser(user);
        if (!userValid) {
            sendResponse(callback, 400, `Need required parameters for User. ${User.requiredProperties.join(' ')}`, null);
        }
        const originalPwd = user.password;
        user.password = await bcrypt.hash(user.password, Number(Env.SALT_ROUNDS));
        user.client_id = req.headers.client_id;
        console.log(user);
        const result = await User.registerUser(user);
        console.log("user");
        const payload = {
            email: user.email,
            scopes: [user.role]
        }
        const newToken = jsonwebtoken.sign(payload, Env.JWT_SECRET, { expiresIn: Env.JWT_EXPIRY });
        sendResponse( callback,200,'Registration Successfull', { token: newToken } );
    } catch (error) {   
        sendResponse(callback, 400, error.message || error, null);
    }
};

userController.forgotPassword = async (callback, req) => {
    try {
        const user = await User.getUserByEmail(req);
        if (!user || !user.email) {
            throw { message: 'User does not exist' }
        }
        const otp = Math.round(Math.random() * 1000000);
        const res = await User.setOTPForUser(otp, user.email);        

        // const emailOpts = {
        //     email: email,
        //     subject: 'Forgot password notification for Suparano.ai',
        //     html: `<p>Hi ${user.full_name}, </p><br /> <h4>Forgot password request has been raised for Suparano.ai </h4><br />
        //         <p>To continue, please use this OTP to set a new password <b>${otp}</b></p><br /> <br />
        //         <p>Thanks and Regards,<br /> Suparano.ai Team</p>`,
        //     name: user.full_name
        // };
        //  await Notification.sendEmail(emailOpts);
        sendResponse(callback, 200, `Otp sent on email`, null);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null);
    }
}

userController.verifyOtpSetPassword = async (callback, req) => {
    try {
        console.log(req.body);
        const { userEmail, otp, newPassword } = JSON.parse(req.body);
        if (!userEmail || !otp || !newPassword) {
            sendResponse(callback, 400, 'Mandatory fields(userEmail, otp, newPassword) required', null)
        }
        const user = await User.getUserByEmail(req);
        if (!user) {
            throw { message: 'User does not exist' }
        }
        if (otp != user.otp) {
            throw { message: 'OTP is incorrect' };
        }
        const passwordHash = await bcrypt.hash(newPassword, Number(Env.SALT_ROUNDS));
        await User.setPassword(passwordHash, user.email);
        sendResponse(callback, 200, `Password changed for ${userEmail}`, null);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null);
    }
}

userController.disableUser = async (callback, req) => {
    try {
        const emails = JSON.parse(req.body);
        if (!emails || emails.length <= 0) {
            sendResponse(callback, 400, `Need required parameters for User(emails).`, null);
        }
        await User.suspendUsers(req);
        sendResponse(callback, 200, `Users suspended.`, null);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null);
    }
};

userController.updateUser = async (callback, req) => {
    try {
        const user = JSON.parse(req.body);
        user.email = req.user.email
        if (!user) {
            sendResponse(callback, 400, `Need required parameters for User. ${User.requiredProperties}`, null);
        }
        if (!User.validateUser(user)) {
            sendResponse(callback, 400, `Need required parameters for User. ${User.requiredProperties}`, null);
        }
        const res = await User.updateUser(user);
        
        sendResponse(callback, 200, `User ${user.email} updated.`, res)
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null);
    }
};

userController.changePassword = async (callback, req) => {
    try {
        const { userEmail, oldPassword, newPassword } = JSON.parse(req.body);
        if (!userEmail || !oldPassword || !newPassword) {
            sendResponse(callback, 400, 'Mandatory fields(userEmail, oldPassword, newPassword) required', null)
        }
        const user = await User.getUserByEmail(userEmail);
        if (!user) {
            throw { message: 'User does not exist' }
        }
        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) {
            throw { message: 'Old password is incorrect' };
        }
        const passwordHash = await bcrypt.hash(newPassword, Number(process.env.SALT_ROUNDS));
        await User.setPassword(passwordHash, user.email);
        sendResponse(callback, 200, `Password changed for ${user.email}`, null);
    } catch (error) {
        sendResponse(callback, 400, error.message || error, null);
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

module.exports = userController;