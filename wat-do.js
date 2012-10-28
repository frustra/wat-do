var express = require('express')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , mongoose = require('mongoose')
  , passport = require('passport');

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
mongoose.connect('mongodb://localhost/watdo');
mongoose.connection.on('error', console.error.bind(console, 'mongodb connection error:'));
mongoose.connection.once('open', function() {
  console.log('opened mongodb connection');
});


// Express
var app = express();
app.realm = config['app_realm'];

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(express.cookieParser()); 
  app.use(express.session({ secret: config['session_secret'] }));
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(function(req, res, next) {
    if (typeof req.user !== 'undefined' && req.user != null) {
      app.locals.user = req.user;
    } else {
      app.locals.user = null;
    }
    next();
  });

  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
  app.use(express.errorHandler());
});


// Setup
setupMain(app);
setupItems(app);
setupLists(app);
setupAuth(app, passport);


http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});
