var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
//var logger = require('morgan');
//var cookieParser = require('cookie-parser');
//var bodyParser = require('body-parser');

var app = express();

GLOBAL.db = './test.db';
GLOBAL.root = __dirname;

var sqlite3 = require('sqlite3').verbose();




// view engine setup

// Register ejs as .html. If we did
// not call this, we would need to
// name our views foo.ejs instead
// of foo.html. The __express method
// is simply a function that engines
// use to hook into the Express view
// system by default, so if we want
// to change "foo.ejs" to "foo.html"
// we simply pass _any_ function, in this
// case `ejs.__express`.

app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));



app.set('view engine', 'html');
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



var db = new sqlite3.Database( GLOBAL.db );
db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS scene ( id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, email TEXT NOT NULL, description TEXT NOT NULL, name TEXT NOT NULL, nickname TEXT NOT NULL, location TEXT NOT NULL, timestamp TEXT NOT NULL, images INT NOT NULL )");
});
db.close();



// app.get('/', function (req, res) {
  // res.send('Hello World!');
// });


//routing table (controllers)

//default
//var routes = require('./routes/index');
//app.use('/', routes);

//user
//var user = require('./routes/user');
//app.get('/user/:id/uploads', user.uploads);


//main
var main = require('./routes/main');
app.get('/play/gallery', main);

//upload
var upload = require('./routes/upload' );
app.post('/play/gallery/upload', upload);

var download = require('./routes/download' );
app.get('/play/gallery/download', download);





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
