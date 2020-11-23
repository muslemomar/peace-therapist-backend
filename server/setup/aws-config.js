const AWS = require('aws-sdk');
const config = require('config');

AWS.config.update({
  region: config.get('AWS_REGION'),
  accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
  secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY')
});

var s3 = new AWS.S3();

module.exports = {s3};
