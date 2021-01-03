const _ = require('lodash');

const {Doctor} = require('../../models/Doctor');

const {UnprocessableEntity, Forbidden, NotFound} = require('../../utils/error');

exports.getDoctors = async (req, res) => {

    // regular patient => regular doctors
    // refugee patient => regular/ngo doctors

    const query = {
        isEmailVerified: true,
        isPhoneVerified: true,
        isDoctorVerified: true
    }, sort = {};

    if (req.isRegularPatient) {
        query.type = Doctor.TYPES.REGULAR;
    }

    if (req.isRefugeePatient) {
        sort.type = 1;
    }

    // Gender: get the doctors whose Doctor.gender === Patient.gender


    const docs = await Doctor
        .find(query)
        .select('type fullName gender profilePic speciality')
        .sort(sort)
        .skip(req.offset)
        .limit(req.limit);

    res.sendData(docs);
};

exports.getAppointment = async (req, res) => {

//    the patient gets an appointment at time:date (09:00 Mon)
//    the doctor receives the appointment,
//    if it's the first appointment, it will have a fixed length of 30 mins
//
};