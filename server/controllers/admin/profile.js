const {CmsUser} = require('../../models/CmsUser');
const _ = require('lodash');

exports.getProfile = async (req, res, next) => {

    res.sendData(req.user);
};

exports.updateProfile = async (req, res, next) => {

    const admin = await CmsUser
        .findOne({_id: req.user._id})
        .select('+password');

    const existingUsername = await CmsUser.countDocuments({
        username: req.body.username,
        _id: {$ne: req.user._id}
    });
    if (existingUsername) return res.sendError('Username already exists', 422);

    if (req.body.oldPassword && req.body.newPassword) {
        const isOldPassCorrect = await admin.verifyPassword(req.body.oldPassword);
        if (!isOldPassCorrect) return res.sendError('Incorrect old password', 422);
        req.body.password = req.body.newPassword;
    }

    admin.set(_.omit(req.body, ['oldPassword', 'newPassword']));
    await admin.save();

    res.sendData();
};
