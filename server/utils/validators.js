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

exports.validateImage = (image) => {

    const supportedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (Array.isArray(image)) {
        return image
            .every(i => i && supportedMimeTypes.includes(i.mimetype));

    } else {
        return image && supportedMimeTypes.includes(image.mimetype);
    }
};

exports.parseBoolean = (str) => {
    if (str === 'true') return true;
    if (str === 'false') return false;
};

exports.validateBoolean = (str) => this.parseBoolean(str) != null;
