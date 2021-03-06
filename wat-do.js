var express = require('express')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , mongoose = require('mongoose')
  , passport = require('passport');

var favicon = require('serve-favicon')
  , bodyParser = require('body-parser')
  , session = require('cookie-session')
  , serveStatic = require('serve-static')
  , morgan = require('morgan')
  , errorhandler = require('errorhandler');

var setupMain = require('./routes/').setupMain
  , setupItems = require('./routes/items').setupItems
  , setupLists = require('./routes/lists').setupLists
  , setupAuth = require('./routes/auth').setupAuth;


// Config
var configFile = {};
if (fs.existsSync(__dirname + '/config.json')) {
  configFile = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));
}

var config = require('hashish').merge(process.env, configFile);


// Database
mongoose.connect(config['MONGOLAB_URI']);
mongoose.connection.on('error', console.error.bind(console, 'mongodb connection error:'));
mongoose.connection.once('open', function() {
  console.log('opened mongodb connection');
});


// Express
var app = express();
app.realm = config['app_realm'];

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use(express.cookieParser());
app.use(session({ secret: config['session_secret'] }));
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  app.locals.devmode = typeof req.query.dev !== 'undefined';
  if (typeof req.user !== 'undefined' && req.user != null) {
    app.locals.user = req.user;
  } else app.locals.user = null;
  if (typeof app.locals.toclient === 'undefined') app.locals.toclient = null;
  next();
});

app.use(serveStatic(path.join(__dirname, 'public')));
app.use(serveStatic(path.join(__dirname, 'assets/js')));

if (app.get('env') == 'development') {
  app.use(morgan('dev'));
  app.use(errorhandler());
}

// Setup
setupItems(app);
setupLists(app);
setupMain(app);
setupAuth(app, passport, config);

var socket = '/tmp/wat-do-node.socket';
if (fs.existsSync(socket)) fs.unlinkSync(socket);

http.createServer(app).listen(process.env.PORT || socket, function() {
  if (!process.env.PORT) fs.chmod(socket, '666');

  console.log("wat-do server listening on port " + (process.env.PORT ? "port " + process.env.PORT : socket));
});
