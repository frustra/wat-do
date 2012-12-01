var moment = require('moment')
  , mongoose = require('mongoose')
  , List = require('../models/list').List
  , User = require('../models/user').User
  , Item = require('../models/item').Item;


exports.getPermission = function(userobj, listobj, user) {
  if (userobj) {
    if (user && userobj._id.equals(user._id)) return 1;
    if (userobj.public) return 0;
  } else if (listobj) {
    if (user && listobj.owner.equals(user._id)) return 3;
    for (var i = 0; i < listobj.members.length; i++) {
      if (user && (listobj.members[i].user._id || listobj.members[i].user).equals(user._id)) return listobj.members[i].permission;
    }
    if (listobj.public) return 0;
  }
  return -1;
}

exports.setupItems = function(app) {
  app.post('/item/new.json', function(req, res) {
    if (req.user) {
      // Save to database and return parsed object
      if (!req.body.list && !req.body.user) req.body.user = req.user._id.toString();
      var newItem = new Item({
        name: req.body.name,
        desc: req.body.desc,
        createdAt: Date.now(),
        start: req.body.start,
        end: req.body.end,
        user: req.body.user ? mongoose.Types.ObjectId(req.body.user) : undefined,
        list: req.body.user ? undefined : mongoose.Types.ObjectId(req.body.list),
        completed: [],
        comments: []
      });
      if (req.body.done === 'true') newItem.setDone(req.body.done, req.user._id);

      var query = (req.body.user ? User : List).findById(req.body.user || req.body.list);
      if (req.body.list) query = query.populate('members.user', '_id', {_id: req.user._id});
      query.exec(function(err, list) {
        if (!err && list) {
          var hasperm = false;
          if (req.body.user && list._id.equals(req.user._id)) {
            hasperm = true;
          } else if (req.body.list && list.owner.equals(req.user._id)) {
            hasperm = true;
          } else if (req.body.list && list.members.length == 1) {
            hasperm = list.members[0].permission >= 1;
          }
          if (hasperm) {
            list.items.push(newItem);
              newItem.save(function(err, newItem) {
                if (!err) {
                  list.save(function(err) {
                    if (!err) {
                      var updatechange = 0;
                      if (newItem.completed.indexOf(req.user._id) < 0 && (newItem.end.getTime() - Date.now()) < ((newItem.end.getTime() - newItem.start.getTime()) * 0.2)) updatechange = 1;
                      res.json({response: {updatechange: updatechange, item: newItem.clientObject(req.user._id), user: newItem.user ? newItem.user_id : undefined, list: newItem.list ? newItem.list._id : undefined}});
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
          } else res.json({error: 'no-permission', msg: 'You do not have permission to edit this list.'});
        } else res.json({error: 'no-list', msg: 'The requested list does not exist.'});
      });
    } else res.json({error: 'no-user', msg: 'You must be logged in to create new items.'});
  });

  app.get('/item/:id.json', function(req, res) {
    Item.findById(req.params.id)
    .populate('user')
    .populate('list')
    .exec(function(err, item) {
      if (!err && item) {
        if (exports.getPermission(item.user, item.list, req.user) >= 0) {
          res.json({response: item.clientObject(req.user ? req.user._id : null)});
        } else res.json({error: 'no-permission', msg: 'You do not have permission to view this item.'});
      } else res.json({error: 'no-item', msg: 'The requested item does not exist.'});
    });
  });

  app.post('/item/:id.json', function(req, res) {
    if (req.user) {
      Item.findById(req.params.id)
      .populate('user')
      .populate('list')
      .exec(function(err, item) {
        if (!err && item) {
          var permission = exports.getPermission(item.user, item.list, req.user);
          if (permission < 0) {
            res.json({error: 'no-permission', msg: 'You do not have permission to edit this list.'});
            return;
          }
          var isupdate = false;
          var updatechange = 0;
          if (item.completed.indexOf(req.user._id) < 0 && (item.end.getTime() - Date.now()) < ((item.end.getTime() - item.start.getTime()) * 0.2)) isupdate = true;

          var newItem = req.body;
          if (permission >= 1) {
            if (typeof newItem.name !== 'undefined') item.name = newItem.name;
            if (typeof newItem.desc !== 'undefined') item.desc = newItem.desc;
            if (typeof newItem.start !== 'undefined') item.start = newItem.start;
            if (typeof newItem.end !== 'undefined') item.end = newItem.end;
          }
          if (typeof newItem.done !== 'undefined') item.setDone(newItem.done, req.user._id);

          if (item.completed.indexOf(req.user._id) < 0 && (item.end.getTime() - Date.now()) < ((item.end.getTime() - item.start.getTime()) * 0.2)) {
            if (!isupdate) updatechange = 1;
          } else if (isupdate) updatechange = -1;

          item.save(function(err, item) {
            if (!err) {
              res.json({response: {updatechange: updatechange, item: item.clientObject(req.user._id), user: item.user ? item.user._id : undefined, list: item.list ? item.list._id : undefined}});
            } else {
              console.log('unknown1: ' + err);
              res.json({error: 'unknown1'});
            }
          });
        } else res.json({error: 'no-item', msg: 'The requested item does not exist.'});
      });
    } else res.json({error: 'no-user', msg: 'You must be logged in to edit this item.'});
  });

  app.delete('/item/:id.json', function(req, res) {
    if (req.user) {
      Item.findById(req.params.id)
      .populate('user')
      .populate('list')
      .exec(function(err, item) {
        if (!err && item) {
          if (exports.getPermission(item.user, item.list, req.user) >= 1) {
            var id = item._id;
            var user = item.user ? item.user_id : undefined;
            var list = item.list ? item.list._id : undefined;
            (item.user || item.list).items.remove(id);
            (item.user || item.list).save(function(err) {
              if (!err) {
                var updatechange = 0;
                if (item.completed.indexOf(req.user._id) < 0 && (item.end.getTime() - Date.now()) < ((item.end.getTime() - item.start.getTime()) * 0.2)) updatechange = -1;
                item.remove(function(err) {
                  if (!err) {
                    res.json({response: {updatechange: updatechange, id: id, user: user, list: list}});
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
          } else res.json({error: 'no-permission', msg: 'You do not have permission to edit this list.'});
        } else res.json({error: 'no-item', msg: 'The requested item does not exist.'});
      });
    } else res.json({error: 'no-user', msg: 'You must be logged in to delete this item.'});
  });

  app.get('/item/new', function(req, res) {
    res.render('index');
  });

  app.get('/item/:id', function(req, res) {
    res.render('index');
  });
};