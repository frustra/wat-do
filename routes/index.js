var moment = require('moment')
  , Item = require('../models/item').Item;

exports.setupRoutes = function(app) {
  app.get('/', function(req, res){
    res.render('items');
  });

  app.get('/about', function(req, res) {
    res.render('items');
  });

  app.get('/item/:id', function(req, res) {
    res.render('items');
  });

  app.get('/items.json', function(req, res) {
    Item.find(function(err, items) {
      res.json(items);
    });
  });

  app.get('/item/:id.json', function(req, res) {
    Item.find({ _id: req.params.id }, function(err, item) {
      if (item && item.length > 0) res.json(item[0]);
      else res.json(undefined);
    });
  });

  app.post('/item/new.json', function(req, res) {
    // Save to database and return parsed object
    var item = new Item({ name: req.body.name, desc: req.body.desc, done: req.body.done === 'true', start: req.body.start, end: req.body.end });
    item.save(function(err) {
      if (!err) res.json(item);
      else res.json(undefined);
    })
  });

  app.post('/item/:id.json', function(req, res) {
    Item.find({ _id: req.params.id }, function(err, items) {
      if (items && items.length > 0) {
        var item = items[0];
        var newItem = req.body;
        if (typeof newItem.name !== 'undefined') item.name = newItem.name;
        if (typeof newItem.desc !== 'undefined') item.desc = newItem.desc;
        if (typeof newItem.done !== 'undefined') item.done = newItem.done === 'true';
        if (typeof newItem.start !== 'undefined') item.start = newItem.start;
        if (typeof newItem.end !== 'undefined') item.end = newItem.end;
        item.save();
        res.json(item);
      } else res.json(undefined);
    });
  });
};
