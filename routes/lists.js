var moment = require('moment')
  , render = require('./').render
  , List = require('../models/list').List
  , User = require('../models/user').User
  , Item = require('../models/item').Item;

exports.setupLists = function(app) {
  app.get('/items.json', function(req, res) {
    if (req.user) {
      User.findById(req.user._id)
      .populate('items')
      .exec(function(err, user) {
        if (!err && user) {
          res.json({response: Item.clientObjects(user.items, req.user._id)});
        } else res.json({error: 'unknown1'});
      });
    } else res.json({error: 'no-user', msg: 'You must be logged in to view this page.'});
  });

  app.get('/list/:id.json', function(req, res) {
    List.findById(req.params.id)
    .populate('items')
    .exec(function(err, list) {
      if (!err && list && (list.public || (req.user && list.owner._id.toString() === req.user._id))) {
        res.json({response: Item.clientObjects(list.items, req.user ? req.user._id : null)});
      } else res.json({error: 'no-list', msg: 'The requested list is not public or does not exist.'});
    });
  });

  app.get('/user/:id.json', function(req, res) {
    var own = req.user && req.params.id.toString() === req.user._id.toString();
    User.findById(req.params.id)
    .populate('items')
    .exec(function(err, user) {
      if (!err && user && (user.public || own)) {
        res.json({response: Item.clientObjects(user.items, req.user ? req.user._id : null)});
      } else res.json({error: 'no-user', msg: 'The requested user\'s list is not public or the user does not exist.'});
    });
  });

  app.get('/user/:id', function(req, res) {
    res.render('index');
  });

  app.get('/list/:id', function(req, res) {
    res.render('index');
  });
};