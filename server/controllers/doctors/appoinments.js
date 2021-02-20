const {t} = require('localizify');
const _ = require('lodash');

const {Appointment} = require('../../models/Appointment');

exports.listAppointments = async (req, res) => {

    const isFirstAppointment = req.query.isFirstAppointment === '1';

    const appointments = await Appointment
        .find({
            doctor: req.user._id,
            ...req.query.isFirstAppointment != null && {
                isFirstAppointment
            }
        });

    res.sendData(appointments);
};
