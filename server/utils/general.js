const _ = require('lodash');
const multer = require('multer');
const async = require('async');
const fs = require('fs');
const path = require('path');
const {tmpdir} = require('os');
const sharp = require('sharp');
const {customAlphabet} = require('nanoid');

exports.genRes = function (data, statusCode, errors) {

    statusCode = statusCode || 200;
    errors = errors || [];

    return {
        data: data || null,
        statusCode,
        errors
    }
};

exports.upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, tmpdir())
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now())
        }
    })
});

exports.getDbDataByDataTableQuery = function (Model, query, modelColumns, populate, project, conditions, customAggregation) {
    let offset = Number(query.start);
    let pageSize = Number(query.length);
    offset = isNaN(offset) || offset < 0 ? 0 : offset;
    pageSize = isNaN(pageSize) || pageSize < 1 ? 10 : pageSize;

    let columns = [];
    if (Array.isArray(query.columns)) {
        query.columns.forEach((col, i) => {
            if (col && modelColumns.includes(col.name)) {
                columns.push({
                    name: col.name,
                    position: i + 1
                });
            }
        });
    }

    let order = {};
    if (Array.isArray(query.order)) {

        query.order.forEach((elem) => {
            if (elem && ['asc', 'desc'].includes(elem.dir) && !isNaN(Number(elem.column))) {
                let column = columns.find(i => i.position === (Number(elem.column) + 1));
                if (column) {
                    order[column.name] = elem.dir;
                }
            }
        });
    }

    let search = query.search;
    let conds = {...conditions};
    if (search && search.value && typeof search.value === 'string') {
        conds.$or = [];
        modelColumns.forEach((col) => {

            if (!['created_at',  'birth_date',  'updated_at',  'createdAt', 'likeCount',  'ngo', 'birthday', 'updatedAt',
            'isDoctorVerified'].includes(col)) {

                let searchCond;
                if (!isNaN(search.value)) {
                    //fix later, make array of number fields, and do not query if search.value is not a number
                    // searchCond = {[col]: search.value};
                    searchCond = {[col]: new RegExp(search.value, 'i')};

                } else {
                    searchCond = {[col]: new RegExp(search.value, 'i')};
                }
                conds.$or.push(searchCond);
            }
        });
    }

    return Promise
        .all([
            Model
                .find(conds)
                .select(project)
                .limit(pageSize)
                .skip(offset)
                .sort(order)
                .populate(populate)
            // .lean()
            ,
            Model
                .countDocuments(conds)
        ])
        .then(([docs, docCount]) => {

            return Promise.resolve({
                recordsFiltered: docCount,
                recordsTotal: docCount,
                data: docs
            });

        })
        .catch(e => {
            return Promise.reject(e);
        })
};

exports.getDbDataByDataTableAggregation = function (req, aggregations) {

    const query = req.query;

    let offset = Number(query.start);
    let pageSize = Number(query.length);
    offset = isNaN(offset) || offset < 0 ? 0 : offset;
    pageSize = isNaN(pageSize) || pageSize < 1 ? 10 : pageSize;

    return Promise
        .all(aggregations(offset, pageSize))
        .then(([docs, docCount]) => {

            docCount = docCount.length ? docCount[0].total : 0;

            return Promise.resolve({
                recordsFiltered: docCount,
                recordsTotal: docCount,
                data: docs
            });

        })
        .catch(e => {
            return Promise.reject(e);
        })
};

exports.leadTimeWithZeroes = (val) => {
    return ('0' + val).slice(-2)
};

function objectToArray(object) {
    const elements = [];

    Object.keys(object).map(i => {

        if (typeof object[i] === 'object') {
            elements.push(...objectToArray(object[i]));
        } else {
            elements.push(object[i]);
        }
    });

    return elements;
}
exports.objectToArray = objectToArray;

exports.arrayToObject = function (array) {
    return array
        .map(i => {
            return {[i]: i}
        })
        .reduce((val, total) => {
            return Object.assign({}, val, total);
        })
};

exports.uniqueShortId = (length) => {
    return customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', length)();
};
