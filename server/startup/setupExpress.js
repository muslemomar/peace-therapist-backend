let express = require('express');
let cookieParser = require('cookie-parser');
const {genRes} = require('./../utils/general');
const {ResError} = require('./../utils/error');

/* wraps express endpoints in an async handler to catch async errors */
require('express-async-errors');

module.exports = (app) => {

    /* Other configurations */
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use(cookieParser());

    /* Helper middleware */
    app.use((req, res, next) => {

        // A helper to send response as data
        res.sendData = data => res.json(genRes(data, 200, []));

        // A helper to send response as error
        res.sendError = (msg, statusCode) => {
            throw new ResError(msg, statusCode);
        };

        // Setup for pagination
        (function setupPagination() {
            let limit = req.query.limit;
            let offset = req.query.offset;

            limit = isNaN(Number(limit)) || limit <= 0 ? 100 : Number(limit);
            offset = isNaN(Number(offset)) || Number(offset) < 0 ? 0 : Number(offset);
            offset = offset * limit;

            req.offset = offset;
            req.limit = limit;
        })();

        next();
    });
};



