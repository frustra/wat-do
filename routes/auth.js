var GoogleStrategy = require('passport-google').Strategy;
var User = require('../models/user').User;

module.exports.setupAuth = function(app, passport) {
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(obj, done) {
    User.findOne({ _id: obj }, function(err, result) {
      done(err, result);
    });
  });

  function processAuth(identifier, profile, done) {
    User.findOne({ openid: identifier }, function(err, result) {
      if (result == null) {
        var user = new User({
          openid: identifier,
          name: profile.displayName,
          email: profile.emails[0].value,
          createdAt: Date.now()
        });
        user.save(function(err, user) {
          if (err) {
            throw err;
          } else {
            done(err, user);
          }
        });
      } else {
        done(err, result);
      }
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
    console.log(req.user)
    res.redirect('/');
  });
};