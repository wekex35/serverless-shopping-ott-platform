module.exports = [{
        scope: 'admin',
        routes: ['/updateUser', '/getUser', '/changeUserPassword','/forgotPassword', '/verifyOtpSetPassword',
        '/getSubscription', '/updateSubscription','/addSubscription',"/buySubscription",'/createStripePaymentIntent']
    },
    {
        scope: 'user',
        routes: ['/getUser', '/updateUser', '/changeUserPassword','/forgotPassword', '/verifyOtpSetPassword',
        '/getSubscription',"/buySubscription",'/createStripePaymentIntent','cancelSubscription'
        ]
    }
];