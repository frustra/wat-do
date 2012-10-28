var moment = require('moment')
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

  app.get('/item/:id', function(req, res) {
    res.render('items');
  });
};