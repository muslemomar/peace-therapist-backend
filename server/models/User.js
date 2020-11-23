const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {Schema} = mongoose;
const {ObjectId} = Schema.Types;
const Joi = require('@hapi/joi').extend(require('joi-phone-number'));
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const config = require('config');
const moment = require('moment');
const mongoose_delete = require('mongoose-delete');
const {sendSms} = require('./../helpers/twilio');
const {generateVerificationToken} = require('./../utils/auth');
const {isValidObjectId} = require('./../utils/validators');
const {sendBasicEmail} = require('./../helpers/mailer');
const {sendSmsAsync} = require('./../helpers/twilio');
const crypto = require('crypto');
const {APP_NAME} = require('./../constants/general');
const {sendEmailVerifyCode} = require('../helpers/mailer');
const winston = require('winston');
let UserSession;


/* User model */

const tokenSchema = {
    expiresAt: Date,
    token: Number
};

const schema = new Schema({
    nickName: {
        type: String,
        required: true
    },
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
    fcmToken: String
}, {
    toJSON: {
        virtuals: true
    },
    timestamps: true
});

schema.index({phoneNumber: 1});
schema.index({email: 1});

if (!schema.options.toJSON) schema.options.toJSON = {};
schema.options.toJSON.transform = function (doc, ret, options) {

    const hide = options.hide || 'deleted updatedAt __v verifyPhone verifyEmail id password isPhoneVerified isEmailVerified';

    hide.split(' ').forEach(prop => delete ret[prop]);

    return ret;
};

schema.statics.getUsersFcmTokens = async function (conds = {}) {

    const users = await mongoose.model('User')
        .find({...conds})
        .select('-_id fcmToken')
        .lean();

    return users.map(i => i && i.fcmToken);
};

schema.statics.getUserFcmTokenById = async function (id) {

    const user = await mongoose.model('User')
        .findById(id)
        .select('-_id fcmToken')
        .lean();

    return user && user.fcmToken;
};

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

schema.methods.generateAuthToken = function () {
    let user = this;

    const payload = {
        _id: user._id.toHexString()
    };

    return new Promise((rs, rj) => {
        const token = jwt.sign(
            payload,
            config.get('JWT_SECRET')
        ).toString();

        UserSession
            .create({
                token,
                user: user._id
            })
            .then((session) => rs(session.token))
            .catch(rj);
    });

};

schema.methods.verifyPassword = function (password) {
    return bcrypt.compare(password, this.password);
};

schema.query.byCredentials = async function (email, phoneNumber, password) {

    const User = this;
    const conds = {};
    if (email) {
        conds.email = email;
    } else {
        conds.phoneNumber = phoneNumber
    }

    const user = await User.findOne(conds, '+password');
    if (!user) return null;

    const isCorrectPassword = await user.verifyPassword(password);

    if (isCorrectPassword) return user;
    else return null;
};

schema.statics.validateSchema = (object, pickKeys, requiredKeys, schemaType) => {

    let customRules = {
        code: Joi.number().min(100000).max(999999).required(),
        isVerified: Joi.boolean()
    };

    let rules;

    rules = {
        nickName: Joi.string().trim().min(1).required(),
        email: Joi.string().trim().min(1).email(),
        phoneNumber: Joi
            .string()
            .phoneNumber({strict: true}),
        password: Joi
            .string()
            .min(8)
            .max(300),
    };

    if (schemaType === 'u') {
        rules = {
            nickName: Joi.string().trim().min(1)
        }
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

    if (schemaType === 'forgot-password') {

        rules = {
            email: Joi.string().trim().min(1).email(),
            phoneNumber: Joi
                .string()
                .phoneNumber({strict: true}),
        };
    }

    return Joi
        .object(rules)
        .validate(object, {abortEarly: false});
};

schema.methods.forgotPassword = function (host, resetMethod) {
    return new Promise((rs, rj) => {

        const User = mongoose.model('User');
        const user = this;

        async function onPasswordResetTokenGenerated(err, buf) {
            if (err) return rj(err);

            const token = buf.toString('hex');

            try {

                await User.updateOne({
                    _id: user._id
                }, {
                    resetPassword: {
                        token: token,
                        expiresAt: Date.now() + 3600000
                    }
                });

                function getPasswordResetMessage() {
                    const resetPasswordLink =  'http://' + host + '/api/users/reset/' + token;
                    if (resetMethod === User.ResetPasswordMethod.EMAIL) {
                        return 'You are receiving this because you (or someone else) have requested the reset ' +
                            'of the password for your account. Please click on the following link, or paste this into ' +
                            'your browser to complete the process: ' + resetPasswordLink;
                    } else {
                        return 'Your password reset link is ' + resetPasswordLink;
                    }

                }

                const passwordResetMessage = getPasswordResetMessage();

                async function sendPasswordResetEmail() {
                    const emailSubject = 'Password Reset Instructions';

                    await sendBasicEmail(user.email, emailSubject, passwordResetMessage);
                }

                async function sendPasswordResetSms() {
                    await sendSmsAsync(user.phoneNumber, passwordResetMessage);
                }

                if (resetMethod === User.ResetPasswordMethod.EMAIL) {
                    await sendPasswordResetEmail();
                } else {
                    await sendPasswordResetSms();
                }

                rs();

            } catch (e) {
                rj(e);
            }
        }

        crypto.randomBytes(20, onPasswordResetTokenGenerated);
    });
};

exports.User = mongoose.model('User', schema);
this.User.ResetPasswordMethod = {
    EMAIL: 1,
    SMS: 2,
};

/*********************************************************/
/** User Session model**/
/*********************************************************/

const sessionSchema = Schema({
    token: {
        type: String,
        index: true
    },
    user: {
        type: ObjectId,
        ref: 'User',
        index: true
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
}, {
    timestamps: false,
    versionKey: false
});

UserSession = mongoose.model('UserSession', sessionSchema, 'userSessions');
exports.UserSession = UserSession;
