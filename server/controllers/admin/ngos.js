const {Doctor} = require('../../models/Doctor');
const {NGO} = require('../../models/NGO');
const {getDbDataByDataTableQuery} = require('./../../utils/general');
const errors = require('./../../utils/error');

exports.getNGOs = async (req, res) => {

    const docs = await getDbDataByDataTableQuery(NGO, req.query, [
        'name',
        'createdAt'
    ]);

    res.send(docs);
};

exports.getOneNGO = async (req, res) => {

    const doc = await NGO.findOne({_id: req.idParam});

    if (!doc) return res.sendError(undefined, 404);

    res.sendData(doc);
};

exports.createNGO = async (req, res) => {

    const doc = await NGO.create(req.body);

    res.sendData(doc);
};

exports.updateNGO = async (req, res) => {

    const doc = await NGO.findOne({_id: req.idParam});

    if (!doc) return res.sendError(undefined, 404);

    doc.set(req.body);
    await doc.save();

    res.sendData();
};

exports.deleteNGO = async (req, res) => {

    const docId = req.idParam;
    const updateConds = {ngo: docId};
    const updateVals = {ngo: null};

    await NGO.deleteById(docId);
    await Doctor.updateMany(updateConds, updateVals);

    res.sendData();
};