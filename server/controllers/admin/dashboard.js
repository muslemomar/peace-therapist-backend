const {User} = require('../../models/User');

exports.getDashboard = async (req, res) => {

    const [userCount] = await Promise.all([
        User.countDocuments({}),
    ]);

    res.sendData({
        userCount,
    });
};
