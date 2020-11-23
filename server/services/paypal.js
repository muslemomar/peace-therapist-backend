const config = require('config');
const winston = require('winston');
let paypal = require('paypal-rest-sdk');


function configurePaypal() {
    const paypalCreds = config.get('PAYPAL');
    const paymentEnv = true ? 'SANDBOX' : 'LIVE';
    const {CLIENT_ID: clientId, SECRET_ID: secretId} = paypalCreds[paymentEnv];

    paypal.configure({
        'mode': paymentEnv.toLowerCase(), //sandbox or live
        'client_id': clientId,
        'client_secret': secretId
    });

    return paypal;
}

paypal = configurePaypal();

exports.createPayment = (host, totalAmount, paymentType) => {

    let returnUrls;

    if (paymentType === 'order') {
        returnUrls = {
            'return_url': `http://${host}/api/cart/paypal-checkout-process`,
            'cancel_url': `http://${host}/api/cart/paypal-checkout-cancel`
        }
    } else if (paymentType === 'reservation') {
        returnUrls = {
            'return_url': `http://${host}/api/reservations/paypal-checkout-process`,
            'cancel_url': `http://${host}/api/reservations/paypal-checkout-cancel`
        }
    }

    const paymentBody = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": returnUrls,
        "transactions": [{
            "amount": {
                "currency": "GBP",
                "total": totalAmount
            },
            "description": "Order"
        }]
    };

    return new Promise((rs, rj) => {

        paypal.payment.create(paymentBody, function (error, paymentIntent) {

            if (error) return rj(error);

            const links = {};
            paymentIntent.links.forEach(function (linkObj) {
                links[linkObj.rel] = {
                    'href': linkObj.href,
                    'method': linkObj.method
                };
            });

            if (!links.hasOwnProperty('approval_url')) return rj('no redirect URI present');

            return rs({
                approvalUrl: links['approval_url'].href,
                paymentIntentId: paymentIntent.id
            });
        });

    });
};

exports.executePayment = (paymentId, PayerID) => {

    return new Promise((rs, rj) => {

        const body = {
            'payer_id': PayerID
        };

        paypal.payment.execute(paymentId, body, function (error, payment) {

            if (error) return rj(error);

            return rs(payment);
        });

    });
};
