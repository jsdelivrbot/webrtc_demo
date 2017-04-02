var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var sessionMiddleware = require('./middleware/sessionMiddleware');
//var session = require('express-session');
//var MongoDBStore = require('connect-mongodb-session')(session);
var bodyParser = require('body-parser');
var log4js = require('log4js');

log4js.configure(require('./log/config'));
var logger = log4js.getLogger('http-connect');

//var ejs = require('ejs');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.engine('html', require('ejs').__express);
// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(sessionMiddleware);

//app.use(session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(log4js.connectLogger(logger, { level: 'auto' })); //http log

/*router*/
app.use('*', require('./routes/index'));
app.use('/', require('./routes/userRoutes'));
app.use('/', require('./routes/chatRoutes'));
//app.use('/users', require('./routes/users'));
/*router end*/

//auth
app.use(function (req, res, next) {
    var err = req.session.error,
        msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) {
        res.locals.message = '<p class="msg error">' + err + '</p>';
    }
    if (msg) {
        res.locals.message = '<p class="msg success">' + msg + '</p>';
    }
    next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;