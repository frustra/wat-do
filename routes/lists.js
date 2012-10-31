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
          res.json(Item.clientObjects(user.items, req.user._id));
        } else res.json(undefined);
      });
    } else res.json(undefined);
  });

  app.get('/list/:id.json', function(req, res) {
    List.findById(req.params.id)
    .populate('items')
    .exec(function(err, list) {
      if (!err && list && (list.public || (req.user && list.owner._id.toString() === req.user._id))) {
        res.json(Item.clientObjects(list.items, req.user ? req.user._id : null));
      } else res.json(undefined);
    });
  });

  app.get('/list/:id', function(req, res) {
    if (req.user) {
      render(req, res, 'items');
    } else {
      List.findById(req.params.id)
      .populate('items')
      .exec(function(err, list) {
        if (!err && list && list.public) {
          render(req, res, 'items');
        } else render(req, res, 'index');
      });
    }
  });

  app.get('/user/:id.json', function(req, res) {
    var own = req.user && req.params.id.toString() === req.user._id.toString();
    User.findById(req.params.id)
    .populate('items')
    .exec(function(err, user) {
      if (!err && user && (user.public || own)) {
        res.json(Item.clientObjects(user.items, req.user ? req.user._id : null));
      } else res.json(undefined);
    });
  });

  app.get('/user/:id', function(req, res) {
    if (req.user) {
      render(req, res, 'items');
    } else {
      User.findById(req.params.id)
      .populate('items')
      .exec(function(err, user) {
        if (!err && user && user.public) {
          render(req, res, 'items');
        } else render(req, res, 'index');
      });
    }
  });
};