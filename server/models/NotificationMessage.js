const mongoose = require('mongoose');
const {Schema} = mongoose;
const {ObjectId} = Schema.Types;
const Joi = require('@hapi/joi');
const _ = require('lodash');
const {objectToArray} = require('./../utils/general');
const {POPULATE_USER_PROJECTION} = require('./../constants/models');
const mongoose_delete = require('mongoose-delete');

const schema = Schema({
    creator: {
        type: ObjectId,
        ref: 'User',
        index: true
    },
    payload: {},
    receivers: [{
        type: ObjectId,
        select: false,
        index: true,
        ref: 'User'
    }]
}, {
    toJSON: {
        virtuals: true
    },
    timestamps: true
});

schema.plugin(mongoose_delete, {overrideMethods: true, deletedAt: true, indexFields: true});

if (!schema.options.toJSON) schema.options.toJSON = {};
schema.options.toJSON.transform = function (doc, ret, options) {

    const hide = options.hide || 'id deleted updatedAt createdAt';

    hide.split(' ').forEach(prop => delete ret[prop]);

    return ret;
};

exports.NotificationMessage = mongoose.model('NotificationMessage', schema, 'notificationMessages');
