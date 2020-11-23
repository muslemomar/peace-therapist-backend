const path = require('path');

module.exports = (app) => {

    app.set('views', path.join(process.cwd(), 'views'));
    app.set('view engine', 'ejs');
};
