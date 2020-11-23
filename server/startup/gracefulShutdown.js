const mongoose = require('mongoose');
const winston = require('winston');

module.exports = (server) => {

    process.on('SIGINT', () => {

        server.close(function (err) {

            function exitWithCode(code) {
                winston.info('[+] Server is shutdown');
                process.exit(code);
            }

            if (err) {
                winston.error(err.message, err);
                return exitWithCode(1);
            }

            mongoose.connection.close(function () {
                return exitWithCode(0);
            });
        })
    });

};
