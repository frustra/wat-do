var moment = require('moment')
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
                  res.json(item.clientObject(req.user._id));
                } else res.json(undefined);
              });
            } else res.json(undefined);
          });
        } else res.json(undefined);
      });
    } else res.json(undefined);
  });

  app.get('/item/:id.json', function(req, res) {
    Item.findById(req.params.id, function(err, item) {
      if (!err && item) {
        res.json(item.clientObject(req.user ? req.user._id : null));
      } else res.json(undefined);
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
          item.save();
          res.json(item.clientObject(req.user._id));
        } else res.json(undefined);
      });
    } else res.json(undefined);
  });

  app.get('/item/new', function(req, res) {
    if (req.user) {
      res.render('items');
    } else {
      res.render('home');
    }
  });

  app.get('/item/:id', function(req, res) {
    // Needs to detect what list item is part of
    if (req.user) {
      Item.findById(req.params.id, function(err, item) {
        if (!err && item) {
          res.render('items');;
        } else res.render('home');
      });
    } else res.render('home');
  });
};