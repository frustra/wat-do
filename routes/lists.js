var moment = require('moment')
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
    .$where('this.public' + (req.user ? ' || this._id.toString() === "' + req.user._id.toString() + '"' : ''))
    .populate('items')
    .exec(function(err, user) {
      if (!err && user) {
        res.json(Item.clientObjects(user.items, req.user._id));
      } else res.json(undefined);
    });
  });

  app.get('/user/:id.json', function(req, res) {
    User.findById(req.params.id)
    .$where('this.public' + (req.user ? ' || this._id.toString() === "' + req.user._id.toString() + '"' : ''))
    .populate('items')
    .exec(function(err, user) {
      if (!err && user) {
        res.json(Item.clientObjects(user.items, req.user._id));
      } else res.json(undefined);
    });
  });
};