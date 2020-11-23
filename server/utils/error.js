exports.ResError = class ResError extends Error {

    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    };
};

exports.UnprocessableEntity = class UnprocessableEntity extends Error {

    constructor(message) {
        super(message);
        this.statusCode = 422;
    };
};

exports.Forbidden = class Forbidden extends Error {

    constructor(message) {
        super(message);
        this.statusCode = 403;
    };
};

exports.NotFound = class NotFound extends Error {

    constructor(message) {
        super(message);
        this.statusCode = 404;
    };
};
