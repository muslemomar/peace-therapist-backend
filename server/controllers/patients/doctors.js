const _ = require('lodash');

const {Doctor} = require('../../models/Doctor');

const {UnprocessableEntity, Forbidden, NotFound} = require('../../utils/error');

exports.getDoctors = async (req, res) => {

    const query = {}, sort = {};

    if (req.isRegularPatient) {
        query.type = Doctor.TYPES.REGULAR;
    }

    if (req.isRefugeePatient) {
        sort.type = 1;
    }

    const docs = await Doctor
        .find(query)
        .select('type fullName gender profilePic speciality')
        .sort(sort)
        .skip(req.offset)
        .limit(req.limit);

    res.sendData(docs);
};
