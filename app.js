var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var engine = require('ejs-mate');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var methodOverride = require('method-override');
var flash = require('connect-flash');

var settings = require('./settings');
var index = require('./routes/index');
var users = require('./routes/users');

// setup log stream
var fs = require('fs');
var accessLogfile = fs.createWriteStream('access.log', {flags: 'a'});
var errorLogfile = fs.createWriteStream('error.log', {flags: 'a'});

var app = express();

// view engine setup
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride());
app.use(session({
	resave:false,
	saveUninitialized: true,
	secret: settings.cookieSecret,
	store: new MongoStore({
			db: settings.db,
			url: 'mongodb://localhost/microblog'
			})
}));

app.use(flash());
app.use(function(req, res, next) {
	res.locals.user = req.session.user;

	var error = req.flash('error');
	var success = req.flash('success');

	res.locals.error = error.length ? error : null;
	res.locals.success = success.length ? success : null;

	next();
});

app.use('/', index);
app.use('/u', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// log
app.use(logger('dev'));
// uncomment this if need to write a log file
//app.use(logger({stream: accessLogfile}));

// error handler begin
app.use(function(err, req, res, next) {
	var meta = '[' + new Date() + ']' + req.url + '\n';
	errorLogfile.write(meta + err.stack + '\n');
	next(err);
});

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
// error handler end

module.exports = app;
