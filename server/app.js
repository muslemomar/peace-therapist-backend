const winston = require('winston');
const config = require('config');

/* Some general setups */
require('./startup/globalConstants');

/* Setup the logger */
require('./startup/logger');

winston.info(`[+] env ${config.util.getEnv('NODE_ENV')}`);

/* Connect DB */
require('./startup/db');

/* Express configurations */
let app = require('express')();

require('./startup/cors')(app);
require('./startup/session')(app);
require('./startup/flashMessages')(app);
require('./startup/client')(app);
require('./startup/setupExpress')(app);
require('./startup/viewEngine')(app);
require('./startup/localization')(app);
require('./startup/passport')(app);
require('./startup/validation');
require('./startup/fcm');
require('./startup/routes')(app);
require('./startup/payment');

const PORT = config.get('PORT');
const server = app.listen(PORT, () => {
    winston.info(`[+] listening on port ${PORT}`);
});

require('./startup/gracefulShutdown')(server);
