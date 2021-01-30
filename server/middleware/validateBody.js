const createError = require('http-errors');
const winston = require('winston');

module.exports = (Model, pickKeys, customRequiredKeys, schemaType) => {
    return (req, res, next) => {

        if (isProductionEnv) {
            winston.info(`${req.method} ${req.originalUrl}, body: ${JSON.stringify(req.body,undefined,2)}`);
        }
        const {error: validationErrors} = Model.validateSchema(req.body, pickKeys, customRequiredKeys, schemaType);
        if (validationErrors == null) return next();

        const errorMessages = validationErrors.details.map(i => i.message);

        next(createError.UnprocessableEntity(errorMessages));
    }
};
