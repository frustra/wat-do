var moment = require('moment')
  , getPermission = require('./items').getPermission
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
      res.json({response: req.user.clientObject()});
    } else res.json({error: 'no-user', msg: 'You must be logged in to view this page.'});
  });

  app.post('/account.json', function(req, res) {
    if (req.user) {
      var newUser = req.body;
      if (typeof newUser.name !== 'undefined') req.user.name = newUser.name;
      if (typeof newUser.public !== 'undefined') req.user.public = newUser.public === 'true';
      req.user.save(function(err, user) {
        if (!err) {
          res.json({response: user.clientObject()});
        } else {
          console.log('unknown2: ' + err);
          res.json({error: 'unknown2'});
        }
      });
    } else res.json({error: 'no-user', msg: 'You must be logged in to view this page.'});
  });

  app.post('/email.json', function(req, res) {
    if (req.user) {
      User.findOne({email: new RegExp('^' + req.body.email + '$', "i")}, '_id email', function(err, user) {
        if (!err && user) {
          res.json({response: user});
        } else res.json({error: 'not-found', msg: 'The email entered does not exist.'});
      });
    } else res.json({error: 'no-user', msg: 'You must be logged in to view this page.'});
  });

  app.get('/updates', function(req, res) {
    res.render('index');
  });

  app.get('/updates.json', function(req, res) {
    if (req.user) {
      doUpdates(req, res);
    } else res.json({error: 'no-user', msg: 'You must be logged in to view this page.'});
  });

  app.post('/updates.json', function(req, res) {
    if (req.user) {
      if (!req.body.list && !req.body.user) req.body.user = req.user._id;
      if (req.body.user) {
        if (req.body.subscribe === 'true') {
          if (req.user.usersubs.indexOf(req.body.user) < 0) req.user.usersubs.push(req.body.user);
        } else req.user.usersubs.remove(req.body.user);
      } else if (req.body.list) {
        if (req.body.subscribe === 'true') {
          if (req.user.listsubs.indexOf(req.body.list) < 0) req.user.listsubs.push(req.body.list);
        } else req.user.listsubs.remove(req.body.list);
      }
      req.user.save(function(err, user) {
        if (!err) {
          doUpdates(req, res);
        } else {
          console.log('unknown2: ' + err);
          res.json({error: 'unknown2'});
        }
      });
    } else res.json({error: 'no-user', msg: 'You must be logged in to subscribe to a list.'});
  });

  function doUpdates(req, res) {
    User.findById(req.user._id)
    .populate('lists', '_id name')
    .populate('usersubs', '_id name')
    .populate('listsubs', '_id name')
    .exec(function(err, user) {
      if (!err && user) {
        Item.find({ $or: [{user: {$in: user.usersubs}}, {list: {$in: user.listsubs}}] })
        .populate('user')
        .populate('list')
        .exec(function(err, items) {
          if (!err && items) {
            var usersubs = {};
            var listsubs = {};
            var notifications = 0;
            for (var i = 0; i < user.usersubs.length; i++) {
              var name = user.usersubs[i].name + '\'s List';
              if (user.usersubs[i]._id.equals(req.user._id)) name = 'Your List';
              usersubs[user.usersubs[i]._id] = {name: name, updates: 0};
            }
            for (var i = 0; i < user.listsubs.length; i++) {
              listsubs[user.listsubs[i]._id] = {name: user.listsubs[i].name, updates: 0};
            }
            for (var i = 0; i < items.length; i++) {
              if (items[i].completed.indexOf(user._id) < 0 && (items[i].end.getTime() - Date.now()) < ((items[i].end.getTime() - items[i].start.getTime()) * 0.2)) { // If item is not complete and has less than 20% of time left.
                if (getPermission(items[i].user, items[i].list, req.user) >= 0) { // Make sure we don't display any notifications for items we don't have permission for.
                  notifications++;
                  if (items[i].user) {
                    usersubs[items[i].user._id].updates++;
                  } else if (items[i].list) listsubs[items[i].list._id].updates++;
                }
              }
            }
            res.json({response: {self: req.user._id, notifications: notifications, lists: user.lists, usersubs: usersubs, listsubs: listsubs}});
          } else {
            console.log('unknown2: ' + err);
            res.json({error: 'unknown2'});
          }
        });
      } else {
        console.log('unknown1: ' + err);
        res.json({error: 'unknown1'});
      }
    });
  }
};