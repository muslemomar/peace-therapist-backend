const {User, UserSession} = require('../../models/User');
const {getDbDataByDataTableQuery} = require('./../../utils/general');
const errors = require('./../../utils/error');

exports.getUsers = async (req, res) => {

    const docs = await getDbDataByDataTableQuery(User, req.query, [
        'nickName',
        'email',
        'phoneNumber',
        'createdAt'
    ]);

    res.send(docs);
};

exports.deleteUser = async (req, res) => {

    const userId = req.idParam;
    const userConds = {user: userId};

    await Promise.all([
        User.delete({_id: userId}),
        UserSession.delete(userConds),
    ]);

    res.sendData();
};

exports.getOneUser = async (req, res) => {

    const user = await User.findOne({_id: req.idParam});

    if (!user) return res.sendError(undefined, 404);

    res.sendData(user);
};

exports.updateUser = async (req, res) => {

    const user = await User
        .findOne({_id: req.idParam});

    if (!user) return res.sendError(undefined, 404);

    if (user.phoneNumber && req.body.email) throw new errors.UnprocessableEntity('"email" is not allowed');
    if (user.email && req.body.phoneNumber) throw new errors.UnprocessableEntity('"phoneNumber" is not allowed');

    if (req.body.email) {
        const existingUser = await User.countDocuments({
            _id: {$ne: user._id},
            email: req.body.email
        });
        if (existingUser) throw new errors.UnprocessableEntity('The email is already used');
        req.body.isEmailVerified = req.body.isVerified;
    }

    if (req.body.phoneNumber) {
        const existingUser = await User.countDocuments({
            _id: {$ne: user._id},
            phoneNumber: req.body.phoneNumber
        });
        if (existingUser) throw new errors.UnprocessableEntity('The phone number is already used');
        req.body.isPhoneVerified = req.body.isVerified;
    }

    delete req.body.isVerified;

    user.set(req.body);
    await user.save();

    res.sendData();
};
