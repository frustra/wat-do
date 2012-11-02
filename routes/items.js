var moment = require('moment')
  , render = require('./').render
  , User = require('../models/user').User
  , Item = require('../models/item').Item;

exports.setupItems = function(app) {
  // TODO: Generalize for the 3 list urls.

  app.post('/item/new.json', function(req, res) {
    if (req.user) {
      // Save to database and return parsed object
      User.findById(req.user._id, function(err, user) {
        if (!err && user) {
          var item = new Item({
            name: req.body.name,
            desc: req.body.desc,
            done: req.body.done === 'true',
            start: req.body.start,
            end: req.body.end
          });
          user.items.push(item);
          item.save(function(err) {
            if (!err) {
              user.save(function(err) {
                if (!err) {
                  res.json({response: item.clientObject(req.user._id)});
                } else res.json({error: 'unknown3'});
              });
            } else res.json({error: 'unknown2'});
          });
        } else res.json({error: 'unknown1'});
      });
    } else res.json({error: 'no-user', msg: 'You must be logged in to create new items.'});
  });

  app.get('/item/:id.json', function(req, res) {
    if (req.user) {
      User.findById(req.user._id)
      .populate('items', null, {_id: req.params.id})
      .exec(function(err, user) {
        if (!err && user) {
          if (user.items.length == 1) {
            res.json({response: user.items[0].clientObject(req.user._id)});
          } else res.json({error: 'no-item', msg: 'The requested item does not exist.'});
        } else res.json({error: 'unknown1'});
      });
    } else res.json({error: 'no-user', msg: 'You must be logged in to view this item.'});
  });

  app.post('/item/:id.json', function(req, res) {
    if (req.user) {
      User.findById(req.user._id)
      .populate('items', null, {_id: req.params.id})
      .exec(function(err, user) {
        if (!err && user) {
          if (user.items.length == 1) {
            var newItem = req.body;
            var item = user.items[0];
            if (typeof newItem.name !== 'undefined') item.name = newItem.name;
            if (typeof newItem.desc !== 'undefined') item.desc = newItem.desc;
            if (typeof newItem.done !== 'undefined') item.setDone(newItem.done, req.user._id);
            if (typeof newItem.start !== 'undefined') item.start = newItem.start;
            if (typeof newItem.end !== 'undefined') item.end = newItem.end;
            item.save(function(err) {
              if (!err) {
                res.json({response: item.clientObject(req.user._id)});
              } else res.json({error: 'unknown2'});
            });
          } else res.json({error: 'no-item', msg: 'The requested item does not exist.'});
        } else res.json({error: 'unknown1'});
      });
    } else res.json({error: 'no-user', msg: 'You must be logged in to edit this item.'});
  });

  app.delete('/item/:id.json', function(req, res) {
    if (req.user) {
      User.findById(req.user._id)
      .populate('items', null, {_id: req.params.id})
      .exec(function(err, user) {
        if (!err && user) {
          if (user.items.length == 1) {
            var id = user.items[0]._id;
            user.items[0].remove(function(err) {
              if (!err) {
                user.items.remove(id);
                user.save(function(err) {
                  if (!err) {
                    res.json({response: id});
                } else res.json({error: 'unknown3'});
                });
              } else res.json({error: 'unknown2'});
            });
          } else res.json({error: 'no-item', msg: 'The requested item does not exist.'});
        } else res.json({error: 'unknown1'});
      });
    } else res.json({error: 'no-user', msg: 'You must be logged in to delete this item.'});
  });

  app.get('/user/:id/item/new', function(req, res) {
    res.render('index');
  });

  app.get('/user/:uid/item/:iid', function(req, res) {
    res.render('index');
  });

  app.get('/list/:id/item/new', function(req, res) {
    res.render('index');
  });

  app.get('/list/:lid/item/:iid', function(req, res) {
    res.render('index');
  });

  app.get('/item/new', function(req, res) {
    res.render('index');
  });

  app.get('/item/:id', function(req, res) {
    res.render('index');
  });
};