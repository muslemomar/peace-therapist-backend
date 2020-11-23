const admin = require("firebase-admin");
const config = require('config');
const {ObjectID} = require('mongodb');
const winston = require('winston');
const {NotificationMessage} = require('./../models/NotificationMessage');

const fcm = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(config.get('FIREBASE_SERVICE_ACCOUNT'))),
    databaseURL: config.get('FIREBASE_DB_URL')
}).messaging();

const NOTIF_ACTIONS = {
    RESERVATION_STATUS_CHANGED: 'RESERVATION_STATUS_CHANGED',
};
exports.NOTIF_ACTIONS = NOTIF_ACTIONS;

function getNotifDataFromAction(action, otherData) {

    const payloadData = {action};

    switch (action) {
        case NOTIF_ACTIONS.RESERVATION_STATUS_CHANGED:
            payloadData.title = `Reservation Status Changed`;
            payloadData.body = `One of your reservation's status has been changed`;
            break;
default:
    }

    (function deleteUnnecessaryFieldsFromData() {
        delete otherData.senderFullName;
    })();

    (function assignOtherDataToPayload() {
        for (let key in otherData) {
            let value = otherData[key];

            if (value instanceof ObjectID) {
                value = value.toHexString();
            }
            payloadData[key] = value;
        }
    })();

    return payloadData;
}

exports.sendNotif = (fcmToken, userIds, action, otherData = {}) => {

    let sendPushNotif = true;
    let storeNotif = true;

    (function validateFcmTokens() {
        if (Array.isArray(fcmToken)) {
            fcmToken = fcmToken.filter(i => i != null);
            if (!fcmToken.length) sendPushNotif = false;
        } else {
            if (!fcmToken) sendPushNotif = false;
            fcmToken = [fcmToken];
        }

    })();

    (function validateUserIds() {

        if (Array.isArray(userIds)) {
            if (!userIds.length) storeNotif = false;
        } else {
            if (!userIds) storeNotif = false;
            userIds = [userIds];
        }
    })();

    const payload = (function assignDataToPayload() {

        let data = getNotifDataFromAction(action, otherData);
        const deviceType = 'android';

        if (deviceType === 'ios') {

            return {
                notification: {
                    sound: 'default',
                    ...data
                }
            }

        } else {
            return {data};
        }

    })();

    /* Store the notification message */
    (function storeNotificationMessage() {
        if (storeNotif) {
            NotificationMessage
                .create({
                    payload: {...payload.data},
                    receivers: userIds,
                    creator: payload.data.userId
                })
                .then(() => {
                    winston.info('Notification stored successfully!');
                })
                .catch((error) => {
                    winston.error(error.message, error);
                })
        }
    })();

    (function sendPushNotifications() {
        if (sendPushNotif) {
            fcm.sendToDevice(fcmToken, payload)
                .then((response) => {
                    winston.info(JSON.stringify({...response, fcmToken}, undefined, 2));

                })
                .catch((error) => {
                    winston.error(error.message, error);
                });
        }
    })();
};
