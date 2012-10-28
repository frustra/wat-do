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

  app.get('/item/:id', function(req, res) {
    res.render('items');
  });

  app.get('/user/:id', function(req, res) {
    User.findById(req.params.id)
    .$where('this.public' + (req.user ? ' || this._id.toString() === "' + req.user._id.toString() + '"' : ''))
    .populate('items')
    .exec(function(err, user) {
      if (!err && user) {
        res.render('items');
      } else res.render('home');
    });
  });

  app.get('/list/:id', function(req, res) {
    List.findById(req.params.id)
    .$where('this.public' + (req.user ? ' || this._id.toString() === "' + req.user._id.toString() + '"' : ''))
    .populate('items')
    .exec(function(err, user) {
      if (!err && user) {
        res.render('items');
      } else res.render('home');
    });
  });

  app.get('/account.json', function(req, res) {
    if (req.user) {
      res.json([req.user._id]);
    } else {
      res.json(undefined);
    }
  });
};