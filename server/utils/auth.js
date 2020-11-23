const _ = require('lodash');
const moment = require('moment');
const crypto = require('crypto');

exports.generateVerificationToken = () => {
    return {
        expiresAt: moment().add(1, 'hour').toDate(),
        token: _.random(100000, 999999)
    }
};
