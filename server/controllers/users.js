const {UserSession, User} = require('../models/UserSession');
const {t} = require('localizify');
const _ = require('lodash');
const moment = require('moment');
const Joi = require('@hapi/joi');
const {UnprocessableEntity, Forbidden, NotFound} = require('../utils/error');
const {generateVerificationToken} = require('../utils/auth');
const {sendSmsAsync} = require('./../services/plivo');
const {sendEmailVerifyCode} = require('./../helpers/mailer');

exports.sendPhoneVerificationCode = async (req, res, next) => {
    if (req.user.isPhoneVerified)
        return next(new UnprocessableEntity("Your phone is already verified"));

    if (!req.user.phoneNumber)
        return next(new UnprocessableEntity("Your account does not have a phone number"));

    req.user.verifyPhone = generateVerificationToken();
    await req.user.save();
    await sendSmsAsync(req.user.phoneNumber, 'Your verification code is ' + req.user.verifyPhone.token);

    res.sendData('Your verification code has been sent to the provided phone number');
};

exports.verifyPhone = async (req, res, next) => {

    if (req.user.isPhoneVerified)
        return next(new UnprocessableEntity("Your phone is already verified"));

    if (!req.user.phoneNumber)
        return next(new UnprocessableEntity("Your account does not have a phone number"));

    req.body.verificationCode = parseInt(req.body.verificationCode);

    if (!_.isSafeInteger(req.body.verificationCode))
        return next(new UnprocessableEntity("valid 'verificationCode' is required"));

    if (!req.user.verifyPhone)
        return next(new UnprocessableEntity("Please generate a new verification code"));

    if (req.user.verifyPhone.token !== req.body.verificationCode)
        return next(new UnprocessableEntity("The 'verificationCode' is invalid"));

    if (req.user.verifyPhone.token === req.body.verificationCode && moment().toDate() > req.user.verifyPhone.expiresAt)
        return next(new UnprocessableEntity("The 'verificationCode' is expired, please generate a new one"));

    req.user.verifyPhone = undefined;
    req.user.isPhoneVerified = true;
    await req.user.save();

    res.sendData('The phone was verified successfully')
};

exports.sendEmailVerificationCode = async (req, res, next) => {
    if (req.user.isEmailVerified)
        return next(new UnprocessableEntity("Your email is already verified"));

    if (!req.user.email)
        return next(new UnprocessableEntity("Your account does not have a email"));

    req.user.verifyEmail = generateVerificationToken();
    await req.user.save();

    await sendEmailVerifyCode(req.user, req.user.verifyEmail.token);

    res.sendData('Your verification code has been sent to the provided email');
};

exports.verifyEmail = async (req, res, next) => {

    if (req.user.isEmailVerified)
        return next(new UnprocessableEntity("Your email is already verified"));

    if (!req.user.email)
        return next(new UnprocessableEntity("Your account does not have an email"));

    req.body.verificationCode = parseInt(req.body.verificationCode);

    if (!_.isSafeInteger(req.body.verificationCode))
        return next(new UnprocessableEntity("valid 'verificationCode' is required"));

    if (!req.user.verifyEmail)
        return next(new UnprocessableEntity("Please generate a new verification code"));

    if (req.user.verifyEmail.token !== req.body.verificationCode)
        return next(new UnprocessableEntity("The 'verificationCode' is invalid"));

    if (req.user.verifyEmail.token === req.body.verificationCode && moment().toDate() > req.user.verifyEmail.expiresAt)
        return next(new UnprocessableEntity("The 'verificationCode' is expired, please generate a new one"));

    req.user.verifyEmail = undefined;
    req.user.isEmailVerified = true;
    await req.user.save();

    res.sendData('The email was verified successfully')
};

exports.forgotPassword = async (req, res) => {

    if (!req.body.phoneNumber && !req.body.email)
        throw new UnprocessableEntity('Please use any of "email" or "phoneNumber"');

    if (req.body.phoneNumber && req.body.email)
        throw new UnprocessableEntity('Please use only one of "email" and "phoneNumber"');

    const user = await User
        .findOne({
            ...req.body.email && {email: req.body.email},
            ...req.body.phoneNumber && {phoneNumber: req.body.phoneNumber},
        })
        .select('email phoneNumber');

    if (!user) throw new NotFound('No such a user');

    const resetMethod = req.body.email ? User.ResetPasswordMethod.EMAIL : User.ResetPasswordMethod.SMS;
    await user.forgotPassword(req.headers.host, resetMethod);

    res.sendData(`${resetMethod === User.ResetPasswordMethod.EMAIL ? 'An email' : 'A sms message'} with reset instructions has been sent`);
};

exports.getPasswordResetPage = async (req, res) => {

    const token = req.params.token;
    const viewName = 'reset-password';

    const user = await User.findOne({
        'resetPassword.token': token,
        'resetPassword.expiresAt': {$gt: new Date()}
    });

    if (!user) {
        req.flash('danger', 'Password reset token is invalid or has expired.');
        return res.render(viewName, {
            showForm: 0,
        });
    }

    res.render(viewName, {
        showForm: 1,
    });

};

exports.processPasswordResetToken = async (req, res) => {

    const token = req.params.token;

    const result = Joi
        .object({
            password1: Joi.number().min(8).required().label('New Password'),
            password2: Joi.custom( (value, helper) => {

                if (value !== req.body.password1) {
                    return helper.message("Confirm Password should be the same as New Password")

                } else {
                    return true
                }

            }),
        })
        .validate(req.body, {abortEarly: false});

    if (result.error) {
        result.error.details.forEach((error) => {
            req.flash('danger', error.message)
        });
        return res.redirect('back');
    }

    try {
        const user = await User.findOne({
            'resetPassword.token': token,
            'resetPassword.expiresAt': {$gt: new Date()}
        });

        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
        }

        user.password = req.body.password1;
        user.resetPassword = undefined;

        await user.save();

    } catch (err) {
        req.flash('danger', 'Error occured!');
        return res.redirect('back');
    }

    req.flash('success', 'Your password was changed successfully');
    res.render('reset-password', {
        showForm: 0,
    });
};
