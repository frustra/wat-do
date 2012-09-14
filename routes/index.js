exports.setupRoutes = function(app) {
  app.get('/', function(req, res){
    res.render('items');
  });
};