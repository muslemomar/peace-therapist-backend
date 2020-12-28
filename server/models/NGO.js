const mongoose = require('mongoose');
const {Schema} = mongoose;
const {ObjectId} = Schema.Types;
const Joi = require('@hapi/joi');
const _ = require('lodash');
const {objectToArray} = require('./../utils/general');
const mongoose_delete = require('mongoose-delete');

const schema = Schema({
    name: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        virtuals: true
    },
    timestamps: true
});

schema.plugin(mongoose_delete, {overrideMethods: true, deletedAt: true, indexFields: true});

if (!schema.options.toJSON) schema.options.toJSON = {};
schema.options.toJSON.transform = function (doc, ret, options) {

    const hide = options.hide || 'id deleted updatedAt createdAt __v';

    hide.split(' ').forEach(prop => delete ret[prop]);

    return ret;
};


schema.statics.validateSchema = (object) => {

    let rules = {
        name: Joi.string().required()
    };

    return Joi
        .object(rules)
        .validate(object, {abortEarly: false});
};

exports.NGO = mongoose.model('NGO', schema, 'ngos');
