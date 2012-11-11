var GoogleStrategy = require('passport-google').Strategy;
var User = require('../models/user').User;
var Item = require('../models/item').Item;

module.exports.setupAuth = function(app, passport) {
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(obj, done) {
    User.findById(obj, function(err, result) {
      done(err, result);
    });
  });

  function processAuth(identifier, profile, done) {
    User.findOne({ openid: identifier }, function(err, result) {
      if (result == null) {
        var firstItem = new Item({
          name: "Welcome to your wat do list!",
          desc: "This list is only viewable by you, but you can set it to public under 'Account'.",
          createdAt: Date.now(),
          start: Date.now(),
          end: Date.now() + 5 * 24 * 60 * 60 * 1000,
          completed: [],
          comments: []
        });
        var user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          openid: identifier,
          createdAt: Date.now(),
          public: false,
          items: [firstItem],
          lists: [],
          usersubs: [],
          listsubs: []
        });
        firstItem.user = user;
        user.usersubs.push(user);
        user.save(function(err, user) {
          if (err) {
            throw err;
          } else {
            firstItem.save(function(err, item) {
              if (err) {
                throw err;
              } else {
                done(err, user);
              }
            });
          }
        });
      } else done(err, result);
    });
  }

  passport.use(new GoogleStrategy({
    returnURL: app.realm + 'auth/google/return',
    realm: app.realm
  }, function(identifier, profile, done) {
    identifier = 'gl-' + identifier.substr(identifier.lastIndexOf('id=') + 3);
    processAuth(identifier, profile, done);
  }));

  app.get('/auth/google', passport.authenticate('google'), function(req, res) {
    res.send('Unknown failure.');
  });

  app.get('/auth/google/return', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
    res.redirect('/');
  });

  app.get('/login', function(req, res) {
    res.redirect('/auth/google');
  });

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });
};