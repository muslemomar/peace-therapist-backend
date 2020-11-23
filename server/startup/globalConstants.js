const config = require('config');

global.isProductionEnv = config.util.getEnv('NODE_ENV') === 'production';
global.isDevelopmentEnv = config.util.getEnv('NODE_ENV') === 'development';
