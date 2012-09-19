var moment = require('moment');

exports.setupRoutes = function(app) {
  app.get('/', function(req, res){
    res.render('items');
  });

  var items = [
    { id: 0, start: 5, end: 100, title: "A", desc: "Some description that may be too long for the box." },
    { id: 1, start: 5, end: 15, title: "Beatle", desc: "Some description that may be too long for the box." },
    { id: 2, start: 10, end: 30, title: "Could", desc: "Some description that may be too long for the box." },
    { id: 3, start: 5, end: 150, title: "Destroy", desc: "Some description that may be too long for the box." },
    { id: 4, start: 0, end: 15, title: "Everything", desc: "Some description that may be too long for the box." },
    { id: 5, start: -15, end: 80, title: "From", desc: "Some description that may be too long for the box." },
    { id: 6, start: 5, end: 15, title: "Germany", desc: "Some description that may be too long for the box." }
  ];

  app.get('/items.json', function(req, res) {
    res.json(items);
  });

  app.get('/item/:id.json', function(req, res) {
    res.json(items[parseInt(req.params.id, 10)]);
  });
};