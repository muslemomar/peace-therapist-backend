const {User, Doctor, UserSession} = require('../../models/User');
const {getDbDataByDataTableQuery} = require('./../../utils/general');
const {UnprocessableEntity, NotFound, Forbidden} = require('./../../utils/error');

exports.getDoctors = async (req, res) => {

    const docs = await getDbDataByDataTableQuery(Doctor, req.query, [
        'fullName',
        'email',
        'phoneNumber',
        'gender',
        'speciality',
        'type',
        'ngo',
        'isDoctorVerified',
        'createdAt'
    ],{
        path: 'ngo',
        select: 'name -_id',
        lean: true
    });

    res.send(docs);
};

/*exports.deleteDoctor = async (req, res) => {

    const userId = req.idParam;
    const userConds = {user: userId};

    await Promise.all([
        User.delete({_id: userId}),
        UserSession.delete(userConds),
    ]);

    res.sendData();
};*/

exports.getOneDoctor = async (req, res) => {

    const doc = await Doctor.findOne({_id: req.idParam});

    if (!doc) return res.sendError(undefined, 404);

    res.sendData(doc);
};

exports.updateDoctor = async (req, res) => {

    const doc = await Doctor
        .findOne({_id: req.idParam});

    if (!doc) return res.sendError(undefined, 404);

    doc.set(req.body);
    await doc.save();

    res.sendData();
};
