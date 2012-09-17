exports.setupRoutes = function(app) {
  app.get('/', function(req, res){
    res.render('items');
  });

  var items = [
    { id: 0, start: 5, end: 100, name: "A" },
    { id: 1, start: 5, end: 15, name: "B" },
    { id: 2, start: 10, end: 30, name: "C" },
    { id: 3, start: 5, end: 150, name: "D" },
    { id: 4, start: 0, end: 15, name: "E" },
    { id: 5, start: -30, end: 80, name: "F" },
    { id: 6, start: 5, end: 15, name: "G" }
  ];

  app.get('/items.json', function(req, res) {
    res.json(items);
  });

  app.get('/item/:id.json', function(req, res) {
    res.json(items[parseInt(req.params.id, 10)]);
  });
};