var moment = require('moment')
  , List = require('../models/list').List
  , User = require('../models/user').User
  , Item = require('../models/item').Item;

exports.setupItems = function(app) {
  function getListObject(requser, userid, listid, permission, item, cb) {
    if (typeof item === 'function') {
      cb = item;
      item = undefined;
    }
    if (listid) {
      var query = List.findById(listid);
      if (requser) query = query.populate('members.user', '_id', {_id: requser._id});
      if (item) query = query.populate('items', null, {_id: item});
      query.exec(function(err, list) {
        if (!err && list) {
          if (requser && list.owner.toString() === requser._id.toString()) {
            cb(list, true);
          } else if (requser && list.members.length == 1) {
            cb(list, list.members[0].permission >= permission);
          } else if (permission == 0) {
            cb(list, list.public);
          } else cb(list, false);
        } else cb(null, false);
      });
    } else if (userid) {
      var query = User.findById(userid);
      if (item) query = query.populate('items', null, {_id: item});
      query.exec(function(err, user) {
        if (!err && user) {
          if (requser && user._id.toString() === requser._id.toString()) {
            cb(user, true);
          } else if (permission == 0) {
            cb(user, user.public);
          } else cb(user, false);
        } else cb(null, false);
      });
    } else cb(null, false);
  }

  function hasPermission(user, item, permission) {
    if (item.user) {
      if (item.user.public) return true;
      if (req.user && item.user._id.toString() === req.user._id.toString()) return true;
    } else if (item.list) {
      if (item.list.public) return true;
      if (req.user && item.list.owner.toString() === req.user._id.toString()) return true;
      for (var i = 0; i < item.list.members.length; i++) {
        if (item.list.members[i].toString() === req.user._id.toString() && item.list.members[i].permission >= permission) {
          return true;
        }
      }
    }
    return false;
  }

  app.post('/item/new.json', function(req, res) {
    if (req.user) {
      // Save to database and return parsed object
      if (!req.body.list && !req.body.user) req.body.user = req.user._id;
      var newItem = new Item({
        name: req.body.name,
        desc: req.body.desc,
        start: req.body.start,
        end: req.body.end,
        user: req.body.list ? undefined : req.body.user,
        list: req.body.list
      });
      if (req.body.done === 'true') newItem.setDone(req.body.done, req.user._id);
      getListObject(req.user, req.body.user, req.body.list, 1, function(list, hasperm) {
        if (list) {
          if (hasperm) {
            list.items.push(newItem);
            newItem.save(function(err) {
              if (!err) {
                list.save(function(err) {
                  if (!err) {
                    res.json({response: newItem.clientObject(req.user._id)});
                  } else res.json({error: 'unknown2'});
                });
              } else res.json({error: 'unknown1'});
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
        if (hasPermission(req.user, item, 0)) {
          res.json({response: item.clientObject(req.user ? req.user._id : null)});
        } else res.json({error: 'no-permission', msg: 'You do not have permission to view this item.'});
      } else res.json({error: 'no-item', msg: 'The requested item does not exist.'});
    });
  });

  app.post('/item/:id.json', function(req, res) {
    if (req.user) {
      if (!req.body.list && !req.body.user) req.body.user = req.user._id;
      getListObject(req.user, req.body.user, req.body.list, 1, req.params.id, function(list, hasperm) {
        if (list) {
          if (hasperm) {
            var newItem = req.body;
            var item = list.items[0];
            if (typeof newItem.name !== 'undefined') item.name = newItem.name;
            if (typeof newItem.desc !== 'undefined') item.desc = newItem.desc;
            if (typeof newItem.done !== 'undefined') item.setDone(newItem.done, req.user._id);
            if (typeof newItem.start !== 'undefined') item.start = newItem.start;
            if (typeof newItem.end !== 'undefined') item.end = newItem.end;
            item.save(function(err) {
              if (!err) {
                res.json({response: item.clientObject(req.user._id)});
              } else res.json({error: 'unknown1'});
            });
          } else res.json({error: 'no-permission', msg: 'You do not have permission to edit this list.'});
        } else res.json({error: 'no-list', msg: 'The requested item does not exist.'});
      });
    } else res.json({error: 'no-user', msg: 'You must be logged in to edit this item.'});
  });

  app.delete('/item/:id.json', function(req, res) {
    if (req.user) {
      if (!req.body.list && !req.body.user) req.body.user = req.user._id;
      getListObject(req.user, req.body.user, req.body.list, 1, req.params.id, function(list, hasperm) {
        if (list) {
          if (hasperm) {
            var id = list.items[0]._id;
            list.items[0].remove(function(err) {
              if (!err) {
                list.items.remove(id);
                list.save(function(err) {
                  if (!err) {
                    res.json({response: id});
                } else res.json({error: 'unknown2'});
                });
              } else res.json({error: 'unknown1'});
            });
          } else res.json({error: 'no-permission', msg: 'You do not have permission to edit this list.'});
        } else res.json({error: 'no-list', msg: 'The requested item does not exist.'});
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