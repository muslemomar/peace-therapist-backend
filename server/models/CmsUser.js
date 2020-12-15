const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const bcrypt = require('bcrypt');
const _ = require('lodash');
const Joi = require('@hapi/joi');

const schema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    }
}, {
    timestamps: true,
    discriminatorKey: 'type'
});

if (!schema.options.toJSON) schema.options.toJSON = {};
schema.options.toJSON.transform = function (doc, ret, options) {

    const hide = options.hide || 'password';

    hide.split(' ').forEach(prop => delete ret[prop]);

    return ret;
};

schema.pre('save', function (next) {
    this.wasNew = this.isNew;
    let user = this;

    if (!user.isModified('password')) return next();

    bcrypt.hash(user.password, 10)
        .then((hash) => {

            user.password = hash;
            next();
        })
        .catch(next)
});

schema.statics.findByCredentials = function (username, password) {

    const Admin = this;
    return Admin
        .findOne({username})
        .select('+password')
        .then((user) => {
            if (!user) {
                return Promise.resolve();
            }
            return new Promise((resolve, reject) => {
                bcrypt.compare(password, user.password, (err, res) => {
                    if (err) {
                        reject(err);
                    }
                    if (res) {
                        resolve(user);
                    } else {
                        resolve();
                    }
                });
            });
        }).catch((e) => {
            return Promise.reject(e);
        });
};

schema.methods.verifyPassword = function (password) {
    return bcrypt.compare(password, this.password);
};

schema.statics.validateSchema = (object, pickKeys) => {

    let rules = {
        fullName: Joi.string().trim().min(3).max(500).required(),
        password: Joi.string().min(8).max(300).required(),
        username: Joi.string().min(3).max(300).required(),
    };
    /* Other custom rules that can be chosen later*/
    let otherRules = {
        oldPassword: Joi.string().min(8).max(300),
        newPassword: Joi.string().min(8).max(300),
    };

    if (Array.isArray(pickKeys) && pickKeys.length > 0) {
        rules = _.pick(Object.assign(rules, otherRules), pickKeys)
    }

    return Joi
        .object(rules)
        .validate(object, {abortEarly: false});
};

exports.CmsUser = mongoose.model('CmsUser', schema, 'cms_users');

exports.Admin = this.CmsUser.discriminator('Admin',
    new Schema({}, {
        discriminatorKey: 'type'
    })
);