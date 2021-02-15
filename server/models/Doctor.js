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
const {DOCTOR_TYPES} = require('./../constants/models');
const {sendEmailVerifyCode} = require('../helpers/mailer');
const model = require('../helpers/model');
const winston = require('winston');

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
    QBUserId: {
        type: String,
        unique: true,
    },
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
    fullName: String,
    birthday: Date,
    gender: String,
    cv: String,
    speciality: String,
    diploma: String,
    type: {
        type: String,
        default: false,
        required: true
    },
    ngo: {
        type: ObjectId,
        ref: 'NGO',
        index: true
    },
    isDoctorVerified: {
        type: Boolean,
        default: false,
        index: true
    }
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

function validateJoiByRules(rules, object, orConds) {
    let joiObject = Joi.object(rules);

    if (orConds) {
        joiObject = joiObject.or(...orConds);
    }

    return joiObject.validate(object, {abortEarly: false});
}

schema.statics.validateSchema = (object, pickKeys, requiredKeys, schemaType, loginType) => {

    let customRules = {}, rules;

    let Doctor = this.Doctor;

    const defaultRules = {
        QBUserId: Joi.string().trim().required(),
        fullName: Joi.string().trim().min(1).required(),
        email: Joi.string().trim().min(1).email().required(),
        birthday: Joi.date().format('YYYY-MM-DD').less('now').required(),
        gender: Joi.string().valid(...Doctor.GENDERS_ARRAY).required(),
        fcmToken: Joi.string(),
        phoneNumber: Joi
            .string()
            .phoneNumber({strict: true})
            .required(),
        password: Joi
            .string()
            .min(8)
            .max(300),
        speciality: Joi.string(),
        type: Joi.string().trim().valid(...Doctor.TYPES_ARRAY).required(),
        ngo: PlainJoi.objectId().when('type', {
            is: Joi.valid(Doctor.TYPES.NGO),
            then: Joi.required(),
            otherwise: Joi.forbidden(),
        }),
    };

    const updateRules = {
        nickName: Joi.string().trim().min(1),
        isDoctorVerified: Joi.boolean()
    };

    const forgotPassRules = {
        email: Joi.string().trim().min(1).email(),
        phoneNumber: Joi
            .string()
            .phoneNumber({strict: true}),
    };

    switch (schemaType) {
        case Doctor.VALIDATION_SCHEMA_TYPES.LOGIN:
            rules = {
                email: Joi.string().trim().min(1).email(),
                password: Joi
                    .string()
                    .min(8)
                    .max(300)
                    .required(),
                phoneNumber: Joi
                    .string()
                    .phoneNumber({strict: true})
            };
            break;
        case 'forgot-password':
            rules = forgotPassRules;
            break;
        case 'u':
            rules = updateRules;
            break;
        default:
            rules = defaultRules;
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

    return validateJoiByRules(rules, object, ['email', 'phoneNumber']);
};

schema.statics.getUsersFcmTokens = model.getUsersFcmTokens;

schema.statics.getUserFcmTokenById = model.getUserFcmTokenById;

/* Methods */

schema.methods.generateAuthToken = model.generateAuthToken;

schema.methods.verifyPassword = model.verifyPassword;

schema.methods.forgotPassword = model.forgotPassword;

/* Query */

schema.query.byCredentials = model.byCredentials;

exports.Doctor = mongoose.model('Doctor', schema);

this.Doctor.ResetPasswordMethod = {
    EMAIL: 1,
    SMS: 2,
};
this.Doctor.TYPES = DOCTOR_TYPES;
this.Doctor.TYPES_ARRAY = objectToArray(DOCTOR_TYPES);

this.Doctor.GENDERS = {
    MALE: 'male',
    FEMALE: 'female'
};

this.Doctor.VALIDATION_SCHEMA_TYPES = {
    LOGIN: 1
};

this.Doctor.GENDERS_ARRAY = objectToArray(this.Doctor.GENDERS);