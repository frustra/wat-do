var moment = require('moment')
  , List = require('../models/list').List
  , User = require('../models/user').User
  , Item = require('../models/item').Item;

exports.setupMain = function(app) {
  app.get('/', function(req, res) {
    res.render('index');
  });

  app.get('/about', function(req, res) {
    res.render('index');
  });

  app.get('/account', function(req, res) {
    res.render('index');
  });

  app.get('/account.json', function(req, res) {
    if (req.user) {
      User.findById(req.user._id, function(err, user) {
        if (!err && user) {
          res.json({response: user.clientObject()});
        } else res.json({error: 'unknown1'});
      });
    } else res.json({error: 'no-user', msg: 'You must be logged in to view this page.'});
  });

  app.post('/account.json', function(req, res) {
    if (req.user) {
      User.findById(req.user._id, function(err, user) {
        if (!err && user) {
          var newUser = req.body;
          if (typeof newUser.name !== 'undefined') user.name = newUser.name;
          if (typeof newUser.public !== 'undefined') user.public = newUser.public === 'true';
          user.save(function(err) {
            if (!err) {
              res.json({response: user.clientObject()});
            } else res.json({error: 'unknown2'});
          });
        } else res.json({error: 'unknown1'});
      });
    } else res.json({error: 'no-user', msg: 'You must be logged in to view this page.'});
  });
};