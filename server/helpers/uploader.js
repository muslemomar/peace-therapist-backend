const _ = require('lodash');
const multer = require('multer');
const async = require('async');
const fs = require('fs');
const config = require('config');
const path = require('path');
const {tmpdir} = require('os');
const sharp = require('sharp');
const {s3} = require('../setup/aws-config');

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

exports.uploadImage = function (image, thumbnail, returnSize, skipCompress, tag) {
    const bucketName = config.get('S3_BUCKET_NAME');

    return new Promise((resolve, reject) => {
        if (!image) return reject(new Error('no_image'));

        fs.readFile(image.path, async (err, data) => {
            if (err) return reject(err);
            if (!data) return reject(new Error('no_image'));

            let operations = {
                image: function (cb) {
                    /*
                    * Reduce image quality and upload it to S3
                    * */

                    function processImage(imageOutput) {
                        let params = {
                            Bucket: bucketName,
                            Key: (Date.now() + _.random(100)) + path.extname(image.originalname),
                            Body: imageOutput
                        };

                        let tasks = {
                            img: function (cb) {
                                s3.upload(params, (err, uploadedImg) => {
                                    if (err) return cb(err);
                                    cb(null, uploadedImg);
                                });
                            }
                        };

                        async.parallel(tasks, (err, results) => {
                            if (err) return cb(err);
                            let uploadedImage = results.img;

                            cb(null, uploadedImage);
                        });
                    }

                    if (skipCompress) {
                        processImage(data);
                    } else {

                        sharp(data)
                            .resize({quality: 80})
                            .toBuffer()
                            .then(processImage)
                            .catch(cb);
                    }

                },
            };

            if (thumbnail) {
                /*
                * Reduce image quality, resize it and upload it to S3
                * */
                operations.thumb = function (cb) {
                    sharp(data)
                        .resize({quality: 80})
                        .resize(100)
                        .toBuffer()
                        .then((imageOutput) => {
                            let params = {
                                Bucket: bucketName,
                                Key: (Date.now() + _.random(100)) + path.extname(image.originalname),
                                Body: imageOutput
                            };

                            s3.upload(params, (err, uploadedImg) => {
                                if (err) return cb(err);
                                cb(null, uploadedImg);
                            });
                        }).catch(cb);
                };
            }

            async.parallel(operations, (err, images) => {
                if (err) return reject(err);

                let output = {
                    img_key: images.image.key,
                    Location: images.image.Location
                };
                if (thumbnail) {
                    output.thumb_key = images.thumb.key;
                }

                resolve({
                    ...output,
                    ...tag != null && {tag}
                });
            });
        });
    });
};

exports.uploadImages = (images, returnSize) => {
    return new Promise((rs, rj) => {
        if(!images || images.length === 0) return rj();
        Promise.all(images.map(i => this.uploadImage(i,null,returnSize)))
            .then(rs)
            .catch(rj);
    });
};

