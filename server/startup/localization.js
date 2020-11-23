let localizify = require('localizify');
localizify = new localizify.Instance();

const supportedLanguages = [
    {en: require('./../locales/en')},
];

supportedLanguages.forEach((lang) => {
    const langKey = Object.keys(lang)[0];
    localizify.add(langKey, lang[langKey]);
});

require('localizify').t = localizify.translate.bind(localizify);

module.exports = (app) => {

    const defaultLang = "en";

    app.use((req, res, next) => {

        let lang = req.headers['lang'] || defaultLang;
        if(!supportedLanguages.map(i => Object.keys(i)[0]).includes(lang)) {
            lang = defaultLang;
        }
        localizify.setLocale(lang);
        next();
    });

};
