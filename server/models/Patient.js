const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {Schema} = mongoose;
const {ObjectId} = Schema.Types;
const Joi = require('@hapi/joi').extend(require('joi-phone-number')).extend(require('@hapi/joi-date'));
const PlainJoi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const config = require('config');
const moment = require('moment');
const mongoose_delete = require('mongoose-delete');
const {generateVerificationToken} = require('./../utils/auth');
const {isValidObjectId} = require('./../utils/validators');
const {objectToArray} = require('./../utils/general');
const {sendBasicEmail} = require('./../helpers/mailer');
const {sendSmsAsync, sendSms} = require('./../services/plivo');
const crypto = require('crypto');
const {APP_NAME} = require('./../constants/general');
const {PATIENT_TYPES} = require('./../constants/models');
const {sendEmailVerifyCode} = require('../helpers/mailer');
const model = require('../helpers/model');
const winston = require('winston');


/* Patient model */
const tokenSchema = {
    expiresAt: Date,
    token: Number
};

const schema = new Schema({
    email: {
        type: String,
        trim: true,
        minlength: 1,
        lowercase: true
    },
    phoneNumber: {
        type: String,
        trim: true,
        minlength: 1
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    verifyPhone: tokenSchema,
    verifyEmail: tokenSchema,
    profilePic: String,
    password: {
        type: String,
        select: false,
        required: true
    },
    resetPassword: {
        token: String,
        expiresAt: Date
    },
    fcmToken: String,
    nickName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: false,
        required: true
    },
    tempProtCardId: String
}, {
    toJSON: {
        virtuals: true
    },
    timestamps: true,
});

schema.index({phoneNumber: 1});
schema.index({email: 1});

schema.plugin(mongoose_delete, {overrideMethods: true, deletedAt: true, indexFields: true});

if (!schema.options.toJSON) schema.options.toJSON = {};
schema.options.toJSON.transform = function (doc, ret, options) {

    const hide = options.hide || 'deleted updatedAt __v verifyPhone verifyEmail id password';
    hide.split(' ').forEach(prop => delete ret[prop]);

    return ret;
};

/* Hooks */

schema.pre('save', function (next) {
    this.wasNew = this.isNew;

    let user = this;

    if (this.isNew) {
        user[user.phoneNumber ? 'verifyPhone' : 'verifyEmail'] = generateVerificationToken();
    }

    if (user.isModified('password')) {
        bcrypt.hash(user.password, 10)
            .then((hash) => {

                user.password = hash;
                next();
            })
            .catch(next)
    } else {
        next();
    }

});

schema.post('save', async function (doc, next) {

    if (!this.wasNew) return next();

    if (doc.phoneNumber) {
        const welcomeMessage = `Welcome to ${APP_NAME}, your verification code is`;

        sendSms(doc.phoneNumber, welcomeMessage + ' ' + doc.verifyPhone.token);
    }

    if (doc.email) {
        await sendEmailVerifyCode(doc, doc.verifyEmail.token).catch(e => winston.error(e.message, e));
    }

    next();
});

/* Statics */

schema.statics.validateSchema = (object, pickKeys, requiredKeys, schemaType) => {

    let customRules = {}, rules;

    let Patient = this.Patient;

    const defaultRules = {
        nickName: Joi.string().trim().min(1).required(),
        email: Joi.string().trim().min(1).email(),
        phoneNumber: Joi
            .string()
            .phoneNumber({strict: true}),
        password: Joi
            .string()
            .min(8)
            .max(300),
        fcmToken: Joi.string(),
        type: Joi.string().trim().valid(...Patient.TYPES_ARRAY).required(),
        tempProtCardId: Joi.string().length(11).pattern(/^[0-9]+$/)
            .when('type', {
                is: Joi.valid(Patient.TYPES.REGULAR),
                then: Joi.forbidden(),
                otherwise: Joi.required()
            }),
    };

    const updateRules = {
        nickName: Joi.string().trim().min(1),
    };

    const forgotPassRules = {
        email: Joi.string().trim().min(1).email(),
        phoneNumber: Joi
            .string()
            .phoneNumber({strict: true}),
    };

    switch (schemaType) {
        case 'forgot-password':
            rules = forgotPassRules;
            break;
        case 'u':
            rules = updateRules;
            break;
        default: rules = defaultRules;
    }

    if (Array.isArray(pickKeys) && pickKeys.length > 0) {
        rules = _.pick(Object.assign({}, rules, customRules), pickKeys)
    }

    if (Array.isArray(requiredKeys)) {
        requiredKeys.forEach((elem) => {
            if (rules[elem]) {
                rules[elem] = rules[elem].required();
            }
        });
    }

    return Joi
        .object(rules)
        .validate(object, {abortEarly: false});
};

schema.statics.getUsersFcmTokens = model.getUsersFcmTokens;

schema.statics.getUserFcmTokenById = model.getUserFcmTokenById;

/* Methods */

schema.methods.generateAuthToken = model.generateAuthToken;

schema.methods.verifyPassword = model.verifyPassword;

schema.methods.forgotPassword = model.forgotPassword;

/* Query */

schema.query.byCredentials = model.byCredentials;

exports.Patient = mongoose.model('Patient', schema);

this.Patient.ResetPasswordMethod = {
    EMAIL: 1,
    SMS: 2,
};
this.Patient.TYPES = PATIENT_TYPES;
this.Patient.TYPES_ARRAY = objectToArray(PATIENT_TYPES);
