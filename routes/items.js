var moment = require('moment')
  , Item = require('../models/item').Item;

exports.setupItems = function(app) {
  app.get('/user/:id.json', function(req, res) {
    // TODO: Permission check
    List.find({ _id: req.params.id }, function(err, list) {
      if (list && list.length > 0) res.json(formatListForClient(req, list[0]));
      else res.json(undefined);
    });
  });

  app.get('/item/:id.json', function(req, res) {
    Item.find({ _id: req.params.id }, function(err, item) {
      if (item && item.length > 0) res.json(formatItemForClient(req, item[0]));
      else res.json(undefined);
    });
  });

  app.post('/item/new.json', function(req, res) {
    if (req.user) {
      // Save to database and return parsed object
      var item = new Item({ name: req.body.name, desc: req.body.desc, done: req.body.done === 'true', start: req.body.start, end: req.body.end });
      item.save(function(err) {
        if (!err) res.json(formatItemForClient(req, item));
        else res.json(undefined);
      })
    } else {
      res.json([]);
    }
  });

  app.post('/item/:id.json', function(req, res) {
    if (req.user) {
      Item.find({ _id: req.params.id }, function(err, items) {
        if (items && items.length > 0) {
          var item = items[0];
          var newItem = req.body;
          if (typeof newItem.name !== 'undefined') item.name = newItem.name;
          if (typeof newItem.desc !== 'undefined') item.desc = newItem.desc;
          if (typeof newItem.done !== 'undefined') {
            if (newItem.done === 'true') {
              item.completed.push(req.user._id);
            } else item.completed.remove(req.user._id);
          }
          if (typeof newItem.start !== 'undefined') item.start = newItem.start;
          if (typeof newItem.end !== 'undefined') item.end = newItem.end;
          item.save();
          res.json(formatItemForClient(req, item));
        } else res.json(undefined);
      });
    } else {
      res.json([]);
    }
  });
};

function formatItemForClient(req, item) {
  var tmp = item.toObject();
  tmp.done = item.completed.indexOf(req.user._id) >= 0;
  tmp.completed = undefined;
  return tmp;
}
function formatItemsForClient(req, items) {
  var tmp = [];
  for (var i = 0; i < items.length; i++) {
    tmp[i] = items[i].toObject();
    tmp[i].done = items[i].completed.indexOf(req.user._id) >= 0;
    tmp[i].completed = undefined;
  }
  return tmp;
}