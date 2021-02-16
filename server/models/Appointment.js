const mongoose = require('mongoose');
const {Schema} = mongoose;
const {ObjectId} = Schema.Types;
const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));
//require('@hapi/joi-date')
const _ = require('lodash');
const moment = require('moment');

const {objectToArray} = require('./../utils/general');
const {Forbidden, UnprocessableEntity} = require('./../utils/error');
const mongoose_delete = require('mongoose-delete');

const schema = Schema({
    startDate: {
        type: Date,
        set: v => typeof v === 'string' ? moment(v, 'DD/MM/YYYY HH:mm').toDate() : v
    },
    endDate: {
        type: Date,
        set: v => typeof v === 'string' ? moment(v, 'DD/MM/YYYY HH:mm').toDate() : v
    },
    doctor: {
        type: ObjectId,
        ref: 'Doctor'
    },
    patient: {
        type: ObjectId,
        ref: 'Patient'
    },
    isFirstAppointment: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: {
        virtuals: true,
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

schema.statics.validateSchema = (object, pickKeys) => {

    let rules = {
        startDate: Joi.date().format('DD/MM/YYYY HH:mm').greater('now').required(),
        // endDate: Joi.date().format('DD/MM/YYYY HH:mm').greater('now'),
    };

    if (Array.isArray(pickKeys) && pickKeys.length > 0) {
        rules = _.pick(Object.assign({}, rules), pickKeys)
    }
    return Joi
        .object(rules)
        .validate(object, {abortEarly: false});
};

schema.statics.isDateOccupied = async function (doctorId, patientId, startDate, endDate) {
    const Appointment = this;

    if (typeof startDate === 'string') {
        startDate = moment(startDate, 'DD/MM/YYYY HH:mm').toDate();
    }
    if (typeof endDate === 'string') {
        endDate = moment(endDate, 'DD/MM/YYYY HH:mm').toDate();
    }

    return !!(await Appointment
            .findOne({
                ...doctorId && {doctor: doctorId},
                ...patientId && {patient: patientId},
                $or: [
                    {
                        $and: [
                            {startDate: {$lte: startDate}},
                            {endDate: {$gte: startDate}},
                        ]
                    },
                    {
                        $and: [
                            {startDate: {$lte: endDate}},
                            {endDate: {$gte: endDate}},
                        ],
                    }
                ],
            }, {
                _id: 1
            })
            .lean()
    );
};


schema.statics.validateDateOccupancyOfEither = async function (doctorId, patientId, startDate, endDate, showDateInError) {
    const Appointment = this;

    const formattedDate = `${moment(startDate).format('LLLL')} - ${moment(endDate).format('LLLL').slice(-8)}`;

    if (await Appointment.isDateOccupied(doctorId, null, startDate, endDate)) {
        throw new UnprocessableEntity(`The provided date is not available for doctor ${showDateInError ? `(${formattedDate})` : ''}`);
    }

    if (await Appointment.isDateOccupied(null, patientId, startDate, endDate))
        throw new UnprocessableEntity(`The provided date is not available for patient ${showDateInError ? `(${formattedDate})` : ''}`);
};


exports.Appointment = mongoose.model('Appointment', schema);
