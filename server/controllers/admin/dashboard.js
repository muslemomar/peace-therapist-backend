const {User, Patient, Doctor} = require('../../models/User');
const {NGO} = require('../../models/NGO');

exports.getDashboard = async (req, res) => {

    const [
        regularUserCount,
        refugeeUserCount,
        regularDoctorCount,
        ngoDoctorCount,
        ngoCount
    ] = await Promise.all([
        Patient.countDocuments({type: Patient.TYPES.REGULAR}),
        Patient.countDocuments({type: Patient.TYPES.REFUGEE}),
        Doctor.countDocuments({type: Doctor.TYPES.REGULAR}),
        Doctor.countDocuments({type: Doctor.TYPES.NGO}),
        NGO.countDocuments({}),
    ]);

    res.sendData({
        regularUserCount,
        refugeeUserCount,
        regularDoctorCount,
        ngoDoctorCount,
        ngoCount
    });
};
