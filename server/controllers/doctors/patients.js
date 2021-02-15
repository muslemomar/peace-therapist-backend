const {t} = require('localizify');
const _ = require('lodash');
const moment = require('moment');
const winston = require('winston');

const {Doctor} = require('../../models/Doctor');
const {Patient} = require('../../models/Patient');
const {UserSession} = require('../../models/UserSession');
const {NGO} = require('../../models/NGO');
const {Appointment} = require('../../models/Appointment');
const {Program} = require('../../models/Program');

const {UnprocessableEntity, NotFound, Forbidden} = require('../../utils/error');
const {sendEmailVerifyCode} = require('../../helpers/mailer');
const {upload} = require('../../utils/general');
const {uploadImage, uploadFile} = require('../../helpers/uploader');
const authHelper = require('../../helpers/auth');
const {validateImage, validatePdf} = require('../../utils/validators');
const {validateAppointmentDates} = require("../../helpers/dates");

const getPatientQueryConds = () => ({
    $or: [
        {isEmailVerified: true},
        {isPhoneVerified: true},
    ]
});

exports.createProgram = async (req, res) => {

    const patientId = req.idParam;
    const doctorId = req.user._id;

    await (async function validatePatient() {
        const patient = await Patient
            .findOne({
                _id: patientId,
            }, {
                _id: 1
            })
            .lean();

        if (!patient) throw new NotFound('No such a patient');
    })();


    await (async function isThereFirstAppointment() {
        const isThereFirstAppointment = await Appointment
            .findOne({
                patient: patientId,
                doctor: doctorId,
                isFirstAppointment: true
            })
            .lean();
        if (!isThereFirstAppointment) throw new Forbidden('You do not have any first appointments with the provided patient.');
    })();

    await (async function isThereProgramAlready() {
        const program = await Program.findOne({
            patient: patientId,
            doctor: doctorId,
            status: {$ne: Program.STATUS.COMPLETED},
        });
        if (program) throw new Forbidden('A program already exists for the provided patient.');
    })();

    const appointments = [];

    for (let i = 0; i < req.body.weeksDuration; i++) {
        const scheduleDays = req.body.schedule;
        for (let key in scheduleDays) {
            const startDate = moment()
                .set({
                    hour: scheduleDays[key].slice(0,2),
                    minutes: scheduleDays[key].slice(3)
                })
                .add(i + 1, 'week')
                .day(key);

            appointments.push({
                startDate: startDate.toDate(),
                endDate: startDate.add(req.body.minsDuration, 'minutes').toDate(),
                patient: patientId,
                doctor: doctorId,
            });
        }
    }

    for (let appointment of appointments) {
        await Appointment.validateDateOccupancyOfEither(
            doctorId,
            patientId,
            appointment.startDate,
            appointment.endDate,
            true
        );
    }

    await Appointment.create(appointments);

    await Program.create({
        patient: patientId,
        doctor: doctorId,
        status: Program.STATUS.CREATED,
        ...req.body
    });

    res.sendData();
};

exports.listPatientAppointments = async (req, res) => {

    const patient = await Patient
        .findOne({
            _id: req.idParam,
            ...getPatientQueryConds(req)
        })
        .select('id')
        .lean();

    if (!patient) throw new NotFound('No such a patient');

    const appointments = await Appointment
        .find({
            patient: patient._id
        })
        .select('startDate endDate');

    res.sendData(appointments);
};
