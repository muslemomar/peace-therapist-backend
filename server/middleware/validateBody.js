const createError = require('http-errors');

module.exports = (Model, pickKeys, customRequiredKeys, schemaType) => {
    return (req, res, next) => {

        console.log('req.body',req.body);
        const {error: validationErrors} = Model.validateSchema(req.body, pickKeys, customRequiredKeys, schemaType);
        if (validationErrors == null) return next();

        const errorMessages = validationErrors.details.map(i => i.message);

        next(createError.UnprocessableEntity(errorMessages));
    }
};
