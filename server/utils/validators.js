const ObjectId = require('mongoose').Types.ObjectId;

exports.isValidObjectId = (val) => ObjectId.isValid(val);

exports.areValidateCoordinates = (coords) => {
    return Array.isArray(coords) &&
        coords.length === 2 &&
        coords[0] >= -180 && coords[0] <= 180 &&
        coords[1] >= -90 && coords[1] <= 90;
};

exports.validateAndParseCoordinates = (coords) => {
    if (!this.areValidateCoordinates(coords)) {
        return null;
    } else {
        return coords.map(i => Number(i));
    }
};

const validateFileType = (file, validMimeTypes) => {

    if (Array.isArray(file)) {
        return file
            .every(i => i && validMimeTypes.includes(i.mimetype));

    } else {
        return file && validMimeTypes.includes(file.mimetype);
    }
};

exports.validateImage = (file) => validateFileType(file, ['image/jpeg', 'image/jpg', 'image/png']);

exports.validatePdf = (file) => validateFileType(file, ['application/pdf']);

exports.parseBoolean = (str) => {
    if (str === 'true') return true;
    if (str === 'false') return false;
};

exports.validateBoolean = (str) => this.parseBoolean(str) != null;
