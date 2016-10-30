var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config');
var compiler = webpack(webpackConfig);
var session = require('express-session');
var compression = require('compression');

var app = express();

// set initial week and year
gWeek = 1;
gYear = 2016;

var db = require('./db_conn_football.js');
var connection = db;
var statement = "SELECT * FROM addy_ai_football.time WHERE time_id = 1;";
connection.query(statement, function(err, result) {
  if (err) {
    console.log('Cannot change lock status: ' + err);
  } else {
    console.log('Successfully changed lock status');
    gWeek = result[0].week;
    gYear = result[0].year;
  }
});

var io = require('socket.io')();
app.io = io;

var notifications = require('./routes/sockets/notifications')(app.io);



var routes = require('./routes/index');
var news = require('./routes/news');
var automatedtasks = require('./routes/automatedtasks');
var football = require('./routes/football');
var login = require('./routes/login');
var voting = require('./routes/voting');
var league = require('./routes/league');
var footballtasks = require('./routes/footballtasks');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(compression());

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
if (app.get('env') === 'development') {
    app.use(require('webpack-dev-middleware')(compiler, {
        noInfo: true,
        publicPath: webpackConfig.output.publicPath
    }));
    app.use(require('webpack-hot-middleware')(compiler));
}

console.log('variable is: ' + app.get('env'));

// session middleware
app.use(session({
  secret: 'football session',
  resave: false,
  saveUninitialized: false
}));

app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/news', news);
app.use('/tasks', automatedtasks);

app.use('/football', football);
app.use('/football/login', login);
app.use('/football/voting', voting);
app.use('/football/league', league);
app.use('/football/tasks', footballtasks);

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
