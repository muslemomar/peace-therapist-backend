const sgMail = require('@sendgrid/mail');
const config = require('config');
sgMail.setApiKey(config.get('SENDGRID_API_KEY'));

exports.sendEmailVerifyCode = async (user, verificationCode) => {
    const fromEmail = 'info@itdropshop.com';
    const fromName = 'Peace';
    const lang = 'en';

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

    const fromEmail = 'info@itdropshop.com';
    const fromName = 'Peace';

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
