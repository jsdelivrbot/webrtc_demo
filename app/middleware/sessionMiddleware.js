var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var dbSettings = require('../db/settings');

module.exports = session({
    secret: dbSettings.COOKIE_SECRET,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: new MongoDBStore({
        uri: `mongodb://${dbSettings.HOST}:${dbSettings.PORT}/${dbSettings.DB}`,
        collection: 'mySessions'
    }),
    // Boilerplate options, see:
    // * https://www.npmjs.com/package/express-session#resave
    // * https://www.npmjs.com/package/express-session#saveuninitialized
    resave: true,
    saveUninitialized: true
});