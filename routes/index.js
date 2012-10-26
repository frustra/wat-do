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
    var item = new Item({ name: req.body.name, desc: req.body.desc, done: req.body.done, start: req.body.start, end: req.body.end });
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
        if (newItem.name != undefined) item.name = newItem.name;
        if (newItem.desc != undefined) item.desc = newItem.desc;
        if (newItem.done != undefined) {
          console.log('good: ' + newItem.done);
          item.done = newItem.done; // What the fuck is going on?
          console.log('end: ' + item.done);
        }
        if (newItem.start != undefined) item.start = newItem.start;
        if (newItem.end != undefined) item.end = newItem.end;
        console.log(item.done);
        item.save();
        res.json(item);
        console.log(item.done);
      } else res.json(undefined);
    });
  });
};