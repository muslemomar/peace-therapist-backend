const sgMail = require('@sendgrid/mail');
const config = require('config');
sgMail.setApiKey(config.get('SENDGRID_API_KEY'));

const fromEmail = 'info@peacesoftware.co';
const fromName = 'Peace';

exports.sendEmailVerifyCode = async (user, verificationCode) => {

    let msg = {
        to: user.email,
        from: {
            email: fromEmail,
            name: fromName
        },
        subject: 'Email Verification',
        text: 'Your verification code is ' + verificationCode,
    };

    await sgMail.send(msg);
};

exports.sendBasicEmail = async (recipientEmail, subject, text, options = {}) => {

    let msg = {
        to: recipientEmail,
        from: {
            email: fromEmail,
            name: fromName
        },
        subject: subject,
        text: text,
    };

    await sgMail.send(msg);
};
