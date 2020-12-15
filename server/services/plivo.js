const config = require('config');
const winston = require('winston');
let plivo = require('plivo');

const plivoAuthId = config.get('PLIVO_AUTH_ID');
const plivoAuthToken = config.get('PLIVO_AUTH_TOKEN');

let client = new plivo.Client(plivoAuthId, plivoAuthToken);

const jinPhone = '+905078855744';
const muslimPhone = '+905349270292';

exports.sendSms = (phone, message) => {

    phone = muslimPhone;

    client
        .messages
        .create(
            jinPhone, // source number with country code
            phone, // destination number with country code
            message
        )
        .then(function (message_created) {})
        .catch(e => winston.error(e.message, e));

};


exports.sendSmsAsync = (phone, message) => {

    return new Promise((rs, rj) => {

        client.messages
            .create(
                jinPhone, // source number with country code
                phone, // destination number with country code
                message
            )
            .then(rs)
            .catch(rj);
    });
};

