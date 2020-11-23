const config = require('config');
const winston = require('winston');

const accountSid = config.get('TWILIO_ACCOUNT_SID');
const authToken = config.get('TWILIO_AUTH_TOKEN');

exports.sendSms = (phone, message) => {
    const client = require('twilio')(accountSid, authToken);
    client.messages
        .create({
            body: message,
            from: config.get('TWILIO_PHONE_NUMBER'),
            to: phone
        })
        .then()
        .catch(e => winston.error(e.message, e));
};


exports.sendSmsAsync = (phone, message) => {
    return new Promise((rs, rj) => {
        const client = require('twilio')(accountSid, authToken);
        client.messages
            .create({
                body: message,
                from: config.get('TWILIO_PHONE_NUMBER'),
                to: phone
            })
            .then(rs)
            .catch(rj);
    });
};

