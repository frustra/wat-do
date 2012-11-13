var moment = require('moment')
  , getPermission = require('./items').getPermission
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
          res.json({response: {permission: 1, name: 'Your List', list: Item.clientObjects(user.items, req.user._id)}});
        } else {
          console.log('unknown1: ' + err);
          res.json({error: 'unknown1'});
        }
      });
    } else res.json({error: 'no-user', msg: 'You must be logged in to view this page.'});
  });

  app.post('/list/new.json', function(req, res) {
    if (req.user) {
      var newList = new List({
        name: req.body.name,
        public: req.body.public === 'true',
        owner: req.user,
        members: [],
        items: []
      });
      newList.save(function(err, list) {
        if (!err) {
          req.user.lists.push(list);
          req.user.listsubs.push(list);
          req.user.save(function(err) {
            if (!err) {
              res.json({response: {_id: list._id, name: list.name}});
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
    } else res.json({error: 'no-user', msg: 'You must be logged in to create new lists.'});
  });

  app.get('/list/:id.json', function(req, res) {
    List.findById(req.params.id)
    .populate('members.user', '_id email')
    .populate('items')
    .exec(function(err, list) {
      if (!err && list) {
        var permission = getPermission(null, list, req.user);
        if (permission >= 0) {
          res.json({response: {_id: list._id, name: list.name, public: list.public, permission: permission, members: list.members, list: Item.clientObjects(list.items, req.user ? req.user._id : null)}});
        } else res.json({error: 'no-permission', msg: 'You do not have permission to view this list.'});
      } else res.json({error: 'no-list', msg: 'The requested list is not public or does not exist.'});
    });
  });

  app.post('/list/:id.json', function(req, res) {
    if (req.user) {
      List.findById(req.params.id)
      .exec(function(err, list) {
        if (!err && list) {
          var permission = getPermission(null, list, req.user);
          if (permission >= 2) {
            var newList = req.body;
            if (typeof newList.name !== 'undefined') list.name = newList.name;
            if (typeof newList.public !== 'undefined') list.public = newList.public === 'true';
            list.members = [];
            if (typeof newList.members !== 'undefined') {
              for (var member in newList.members) {
                list.members.push({permission: Math.max(Math.min(newList.members[member].permission, 2), 0), user: newList.members[member].user._id});
              }
            }
            list.save(function(err, list) {
              if (!err) {
                res.json({response: {_id: list._id, name: list.name}});
              } else {
                console.log('unknown1: ' + err);
                res.json({error: 'unknown1'});
              }
            });
          } else res.json({error: 'no-permission', msg: 'You do not have permission to edit this list.'});
        }
      });
    } else res.json({error: 'no-user', msg: 'You must be logged in to edit lists.'});
  });

  app.delete('/list/:id.json', function(req, res) {
    if (req.user) {
      List.findById(req.params.id)
      .populate('items')
      .exec(function(err, list) {
        if (!err && list) {
          if (list.owner.equals(req.user._id)) {
            var id = list._id;
            var i = 0;
            function callback(err) {
              if (!err) {
                i++;
                if (i < list.items.length) {
                  list.items[i].remove(callback);
                } else {
                  list.remove(function(err) {
                    if (!err) {
                      res.json({response: id});
                    } else {
                      console.log('unknown2: ' + err);
                      res.json({error: 'unknown2'});
                    }
                  });
                }
              } else {
                console.log('unknown1: ' + err);
                res.json({error: 'unknown1'});
              }
            }
            if (list.items.length > 0) {
              list.items[i].remove(callback);
            } else {
              list.remove(function(err) {
                if (!err) {
                  res.json({response: id});
                } else {
                  console.log('unknown3: ' + err);
                  res.json({error: 'unknown3'});
                }
              });
            }
          } else res.json({error: 'no-permission', msg: 'You do not have permission to delete this list.'});
        } else res.json({error: 'no-list', msg: 'The requested list does not exist.'});
      });
    } else res.json({error: 'no-user', msg: 'You must be logged in to delete this list.'});
  });

  app.get('/user/:id.json', function(req, res) {
    var own = req.user && req.user._id.equals(req.params.id);
    User.findById(req.params.id)
    .populate('items')
    .exec(function(err, user) {
      if (!err && user && (user.public || own)) {
        res.json({response: {permission: own ? 1 : 0, name: user.name + '\'s List', list: Item.clientObjects(user.items, req.user ? req.user._id : null)}});
      } else res.json({error: 'no-user', msg: 'The requested user\'s list is not public or the user does not exist.'});
    });
  });

  app.get('/list/new', function(req, res) {
    res.render('index');
  });

  app.get('/list/:id/edit', function(req, res) {
    res.render('index');
  });

  app.get('/list/:id', function(req, res) {
    res.render('index');
  });

  app.get('/user/:id', function(req, res) {
    res.render('index');
  });
};