var moment = require('moment')
  , List = require('../models/list').List
  , User = require('../models/user').User
  , Item = require('../models/item').Item;

render = exports.render = function(req, res, template) {
  res.render(template, {toclient: {template: template, user: req.user ? req.user.clientObject() : undefined}});
}

exports.setupMain = function(app) {
  app.get('/', function(req, res) {
    if (req.user) {
      render(req, res, 'items');
    } else render(req, res, 'index');
  });

  app.get('/about', function(req, res) {
    if (req.user) {
      render(req, res, 'items');
    } else render(req, res, 'index');
  });

  app.get('/account', function(req, res) {
    if (req.user) {
      render(req, res, 'items');
    } else render(req, res, 'index');
  });

  app.post('/account.json', function(req, res) {
    if (req.user) {
      User.findById(req.user._id, function(err, user) {
        if (!err && user) {
          var newUser = req.body;
          if (typeof newUser.name !== 'undefined') user.name = newUser.name;
          if (typeof newUser.public !== 'undefined') user.public = newUser.public === 'true';
          user.save();
          res.json(user.clientObject());
        } else res.json(undefined);
      });
    } else res.json(undefined);
  });
};