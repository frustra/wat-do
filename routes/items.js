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
      if (listobj.members[i].equals(user._id)) return listobj.members[i].permission;
    }
    if (listobj.public) return 0;
  }
  return -1;
}

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
          if (requser && list.owner.equals(requser._id)) {
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
          if (requser && user._id.equals(requser._id)) {
            cb(user, true);
          } else if (permission == 0) {
            cb(user, user.public);
          } else cb(user, false);
        } else cb(null, false);
      });
    } else cb(null, false);
  }

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
      getListObject(req.user, req.body.user, req.body.list, 1, function(list, hasperm) {
        if (list) {
          if (hasperm) {
            list.items.push(newItem);
            newItem.save(function(err) {
              if (!err) {
                list.save(function(err) {
                  if (!err) {
                    res.json({response: newItem.clientObject(req.user._id)});
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
              } else {
                console.log('unknown1: ' + err);
                res.json({error: 'unknown1'});
              }
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