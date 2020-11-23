const ObjectId = require('mongoose').Types.ObjectId;

exports.requireId = (req, res, next) => {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) return res.sendError('invalid_id',422);
    req.idParam = req.params.id;
    next();
};
