const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');

const {UserSession} = require('./../models/UserSession');

const {sendBasicEmail} = require('./../helpers/mailer');
const {sendSmsAsync, sendSms} = require('./../services/plivo');

module.exports = {
    generateAuthToken: function () {
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
                    userId: user._id,
                    userType: user.constructor.modelName
                })
                .then((session) => rs(session.token))
                .catch(rj);
        });

    },
    verifyPassword: function (password) {
        return bcrypt.compare(password, this.password);
    },
    byCredentials: async function (email, phoneNumber, password) {

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
    },
    forgotPassword: function (host, resetMethod) {
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
                        const resetPasswordLink = 'http://' + host + '/api/users/reset/' + token;
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
    },
    getUserFcmTokenById: async function (conds = {}) {

        const users = await mongoose.model('User')
            .find({...conds})
            .select('-_id fcmToken')
            .lean();

        return users.map(i => i && i.fcmToken);
    },
    getUsersFcmTokens:  async function (conds = {}) {

        const users = await mongoose.model('User')
            .find({...conds})
            .select('-_id fcmToken')
            .lean();

        return users.map(i => i && i.fcmToken);
    },
};