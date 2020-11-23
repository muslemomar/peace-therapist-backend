const history = require('connect-history-api-fallback');
const express = require('express');
let path = require('path');

module.exports = (app) => {

    // enable history mode
    app.use(history({
        // disableDotRule: true,
        /*
        * Don't redirect the request if the path contains /api/
        * (to be more specific, redirects them to their requested path not to vue app)
        * */
        // index: path.join(__dirname, '../public/index.html'),
        rewrites: [
            {
                from: /^\/api\/.*$/,
                to: function(context) {
                    return context.parsedUrl.pathname;
                }
            }
        ]
    }));


    /* Setup vue */
    app.use(express.static(path.join(__dirname, '../public')));
};
