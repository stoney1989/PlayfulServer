var express = require('express');
var path = require('path');

//var favicon = require('serve-favicon');
//var logger = require('morgan');
//var cookieParser = require('cookie-parser');
//var bodyParser = require('body-parser');

var app = express();

GLOBAL.db = './gallery.db';
GLOBAL.captchaSessionTime = 600000; // 10 minutes
GLOBAL.maxSize = 50000000; // ~50 MByte
GLOBAL.maxScenesOnFrontPage = 100;
GLOBAL.root = __dirname;



var sqlite3 = require('sqlite3').verbose();

app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(express.static(path.join(__dirname, 'public')));

var db = new sqlite3.Database( GLOBAL.db );
db.serialize(function() {
	db.run("CREATE TABLE IF NOT EXISTS scene ( id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, email TEXT NOT NULL, description TEXT NOT NULL, name TEXT NOT NULL, nickname TEXT NOT NULL, location TEXT NOT NULL, timestamp TEXT NOT NULL, removehash TEXT NOT NULL, images INT NOT NULL )");
	db.run("CREATE TABLE IF NOT EXISTS captcha_session ( token TEXT PRIMARY KEY NOT NULL, timestamp INTEGER NOT NULL )");
});
db.close();



//show newest Scenes
var main = require('./routes/main');
app.get('/play/gallery', main);

//upload Scenes
var upload = require('./routes/upload' );
app.post('/play/gallery/upload', upload);

//check captcha
var captcha = require('./routes/captcha' );
app.get('/play/gallery/captchacheck', captcha);

//download Scenes
var download = require('./routes/download' );
app.get('/play/gallery/download', download);

//remove Scenes
var remove = require('./routes/remove');
app.route('/play/gallery/remove').all(remove);

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
        // res.render('error', {
            // message: err.message,
            // error: err
        // });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    // res.render('error', {
        // message: err.message,
        // error: {}
    // });
});


module.exports = app;
