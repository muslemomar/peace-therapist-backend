const _ = require('lodash');
const moment = require('moment');

const {
    APPOINTMENT_MIN_DURATION_IN_MINS,
    APPOINTMENT_MAX_DURATION_IN_MINS,
    FIRST_APPOINTMENT_DURATION_IN_MINS
} = require('../../constants/appointments');
const {Doctor} = require('../../models/Doctor');
const {Appointment} = require('../../models/Appointment');
const {UnprocessableEntity, Forbidden, NotFound} = require('../../utils/error');
const {validateAppointmentDates} = require('../../helpers/dates');

const getDoctorQueryConds = (req) => ({
    isEmailVerified: true,
    isPhoneVerified: true,
    isDoctorVerified: true,
    ...req.isRegularPatient && {type: Doctor.TYPES.REGULAR}
});

exports.getDoctors = async (req, res) => {

    // regular patient => regular doctors
    // refugee patient => regular/ngo doctors

    const sort = {};

    if (req.isRefugeePatient) {
        sort.type = 1;
    }

    // Gender: get the doctors whose Doctor.gender === Patient.gender

    const docs = await Doctor
        .find(getDoctorQueryConds(req))
        .select('type fullName gender profilePic speciality')
        .sort(sort)
        .skip(req.offset)
        .limit(req.limit);

    res.sendData(docs);
};

exports.createAppointment = async (req, res) => {

//    the patient gets an appointment at time:date (09:00 Mon)
//    the doctor receives the appointment,
//    if it's the first appointment, it will have a fixed length of 30 mins
//    Min appointment length 20 mins

    const doctor = await Doctor
        .findOne({
            _id: req.idParam,
            ...getDoctorQueryConds(req)
        }, {
            _id: 1
        })
        .lean();

    if (!doctor) throw new NotFound('No such a doctor');

    await (async function isFirstAppointment() {
        const isThereFirstAppointment = await Appointment
            .findOne({
                patient: req.user._id,
                doctor: doctor._id,
            }, {
                _id: 1
            })
            .lean();
        if (isThereFirstAppointment !== null)
            throw new UnprocessableEntity('There is already a first appointment with the provided doctor');
    })();

    validateAppointmentDates(req.body.startDate);

    const doctorId = req.idParam;
    const patientId = req.user._id;
    await Appointment.validateDateOccupancyOfEither(
        doctorId,
        patientId,
        req.body.startDate,
        req.body.endDate
    );

    const appointment = await Appointment.create({
        ...req.body,
        patient: req.user._id,
        doctor: doctor._id,
        isFirstAppointment: true
    });

    res.sendData(appointment);
};