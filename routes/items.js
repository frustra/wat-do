var moment = require('moment')
  , render = require('./').render
  , User = require('../models/user').User
  , Item = require('../models/item').Item;

exports.setupItems = function(app) {
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

  // TODO Add in permissions
  app.get('/item/:id.json', function(req, res) {
    Item.findById(req.params.id, function(err, item) {
      if (!err && item) {
        res.json({response: item.clientObject(req.user ? req.user._id : null)});
      } else res.json({error: 'no-item', msg: 'The requested item does not exists.'});
    });
  });

  app.post('/item/:id.json', function(req, res) {
    if (req.user) {
      Item.findById(req.params.id, function(err, item) {
        if (!err && item) {
          var newItem = req.body;
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
        } else res.json({error: 'no-item', msg: 'The requested item does not exists.'});
      });
    } else res.json({error: 'no-user', msg: 'You must be logged in to edit this item.'});
  });

  app.delete('/item/:id.json', function(req, res) {
    if (req.user) {
      User.findById(req.user._id)
      .populate('items')
      .exec(function(err, user) {
        if (!err && user) {
          for (var i = 0; i < user.items.length; i++) {
            var id = user.items[i]._id;
            if (id.toString() === req.params.id) {
              user.items[i].remove(function(err) {
                if (!err) {
                  user.items.remove(id);
                  user.save(function(err) {
                    if (!err) {
                      res.json({response: id});
                  } else res.json({error: 'unknown3'});
                  });
                } else res.json({error: 'unknown2'});
              });
              break;
            }
          }
        } else res.json({error: 'unknown1'});
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