let winston = require('winston');
const config = require('config');
require('winston-mongodb');
const moment = require('moment');

/* Store logs logs in fs */
winston.add(
    new winston.transports.File({
        dirname: 'logs',
        filename: 'logs.log',
        level: 'silly',
    }),
);

/* Store uncaughtExceptions in fs */
winston.exceptions.handle(
    new winston.transports.File({
        dirname: 'logs',
        filename: 'uncaughtExceptions.log'
    })
);

/* Store logs in MongoDB */
winston.add(
    new winston.transports.MongoDB({
        level: 'silly',
        db: config.get('DB_URL'),
        options: {
            useUnifiedTopology: true
        },
        collection: 'logs'
    })
);

/* Forward unhandledRejection error to uncaughtException, so winston can catch it */
process.on('unhandledRejection', (err) => {
    throw err;
});

winston.add(
    new winston.transports.Console({
        level: 'silly',
        handleExceptions: true,
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({level,exception,timestamp,stack,message}) => {
                timestamp = moment(timestamp).format('DD-MM-YYYY HH:mm:ss Z');

                if(level.match(/error/)) {
                    return `${timestamp} [${stack}]\nException: ${exception}\nLevel: ${level}\nTime: ${timestamp}`;
                } else {
                    return `${timestamp} ${level}: ${message}`
                }
            })
        )
    })
);
