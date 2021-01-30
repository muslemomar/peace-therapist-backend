const mongoose = require('mongoose');
const {Schema} = mongoose;
const {ObjectId} = Schema.Types;
const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));
const _ = require('lodash');
const {objectToArray} = require('./../utils/general');
const mongoose_delete = require('mongoose-delete');

const dayOfWeekTimeType = {
    startDate: {
        type: Date,
    },
/*
    endDate: {
        type: Date,
    },
*/
};

const schema = Schema({
    doctor: {
        type: ObjectId,
        ref: 'Doctor'
    },
    patient: {
        type: ObjectId,
        ref: 'Patient'
    },
    status: String,
    weeksDuration: Number,
    minsDuration: Number,
    schedule: {
        saturday: dayOfWeekTimeType,
        sunday: dayOfWeekTimeType,
        monday: dayOfWeekTimeType,
        tuesday: dayOfWeekTimeType,
        thursday: dayOfWeekTimeType,
        wednesday: dayOfWeekTimeType,
        friday: dayOfWeekTimeType,
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

    /*const dayOfWeekTimeType = {
        startDate: Joi.date().format('HH:mm').greater('now').required(),
        endDate: Joi.date().format('HH:mm').greater('now'),
    };*/

    const dayOfWeekTimeType = Joi.date().format('HH:mm');

    let rules = {
        weeksDuration: Joi.number().min(1).max(12).required(),
        minsDuration: Joi.number().min(20).max(60).required(),
        schedule: Joi.object().keys({
                saturday: dayOfWeekTimeType,
                sunday: dayOfWeekTimeType,
                monday: dayOfWeekTimeType,
                tuesday: dayOfWeekTimeType,
                thursday: dayOfWeekTimeType,
                wednesday: dayOfWeekTimeType,
                friday: dayOfWeekTimeType,
            }).min(1).required()
    };

    return Joi
        .object(rules)
        .validate(object, {abortEarly: false});
};

exports.Program = mongoose.model('Program', schema);
exports.Program.STATUS = {
    CREATED: 'CREATED',
    COMPLETED: 'COMPLETED',
};