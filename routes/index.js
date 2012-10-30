var moment = require('moment')
  , List = require('../models/list').List
  , User = require('../models/user').User
  , Item = require('../models/item').Item;

exports.setupMain = function(app) {
  app.get('/', function(req, res) {
    if (req.user) {
      res.render('items');
    } else {
      res.render('home');
    }
  });

  app.get('/about', function(req, res) {
    if (req.user) {
      res.render('items');
    } else {
      res.render('home');
    }
  });

  app.get('/account', function(req, res) {
    if (req.user) {
      res.render('items');
    } else {
      res.render('home');
    }
  });

  app.get('/account.json', function(req, res) {
    if (req.user) {
      res.json(req.user);
    } else res.json(undefined);
  });

  app.post('/account.json', function(req, res) {
    if (req.user) {
      User.findById(req.user._id, function(err, user) {
        if (!err && user) {
          var newUser = req.body;
          if (typeof newUser.name !== 'undefined') user.name = newUser.name;
          if (typeof newUser.public !== 'undefined') user.public = newUser.public === 'true';
          user.save();
          res.json(user);
        } else res.json(undefined);
      });
    } else res.json(undefined);
  });
};