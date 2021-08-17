"use strict";
const nodemailer = require("nodemailer");
var FCM = require('fcm-node');

const notification = {};
notification.sendEmail = async (emailOptions) => {
    console.log("==================> "+process.env.SMTP_PASSWORD);
    console.log("==================> "+process.env.SMTP_USER);
    try {
        let defaultTransport = nodemailer.createTransport({
            // service : "gamil",
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            // secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            }
        });


        var mailOptions = {
            to : "example@example.com",
            // to: emailOptions.email,
            // cc: ccmaillist,
            from: process.env.ADMIN_EMAIL,
            subject: emailOptions.subject,
            html: emailOptions.html

            // attachments: [{
            //     filename: name + '.csv',
            //     content: csv
            // }],
        };
        // var res = await defaultTransport.sendMail(mailOptions);

        defaultTransport.sendMail(mailOptions, function (error) {
            if (error) {
                console.log("Do Nothing for mail send ...", error);
            } else {
                console.log("Email Sending........")
            }
        });

        return { msg: "Email sent", status: true, data: null };

    } catch (e) {
        console.log(e);
        throw {
            message: e.message
        };
    }

}

notification.sendNotification = async (notiOption) => {
    /* 
    notiOption.title
    notiOption.body
    notiOption.to
    for to as topic => '/topics/<topic_name>
     */
    try {
        var fcm = new FCM(process.env.FCM_SERVER_KEY);
        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            to: notiOption.to,
            notification: {
                title: notiOption.title,
                body: notiOption.body
            },

            // data: {  //you can send only notification or only data(or include both)
            //     title: notiOption.title,
            //     body: notiOption.body
            // }
        };
        fcm.send(message, function (err, response) {
            if (err) {
                console.log(err);
                console.log("Something has gone wrong!");
                return { msg: "Something has gone wrong!", status: true, data: null };

            } else {
                console.log("Successfully sent with response: ", response);
                return { msg: "Successfully sent with response: ", status: true, data: response };
            }
        });

    } catch (e) {
        console.log(e);
        throw {
            message: e.message
        };
    }
}

module.exports = notification;