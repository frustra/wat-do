var moment = require('moment')
  , Item = require('../models/item').Item;

exports.setupRoutes = function(app) {
  app.get('/', function(req, res){
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
    var item = new Item({ name: req.body.name, desc: req.body.desc, start: req.body.start, end: req.body.end });
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
        if (newItem.name) item.name = newItem.name;
        if (newItem.desc) item.desc = newItem.desc;
        if (newItem.start) item.start = newItem.start;
        if (newItem.end) item.end = newItem.end;
        item.save();
        res.json(item);
      } else res.json(undefined);
    });
  });
};