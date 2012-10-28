var moment = require('moment')
  , Item = require('../models/item').Item;

exports.setupLists = function(app) {
  app.get('/items.json', function(req, res) {
    if (req.user) {
      Item.find(function(err, items) {
        res.json(formatItemsForClient(req, items));
      });
    } else {
      res.json([]);
    }
  });

  app.get('/list/:id.json', function(req, res) {
    // TODO: Permission check
    List.find({ _id: req.params.id }, function(err, list) {
      if (list && list.length > 0) res.json(formatListForClient(req, list[0]));
      else res.json(undefined);
    });
  });
};
function formatListForClient(req, items) {
  var tmp = [];
  for (var i = 0; i < items.length; i++) {
    tmp[i] = items[i].toObject();
    tmp[i].done = items[i].completed.indexOf(req.user._id) >= 0;
    tmp[i].completed = undefined;
  }
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