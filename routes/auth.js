var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/user').User;
var Item = require('../models/item').Item;

module.exports.setupAuth = function(app, passport, config) {
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(obj, done) {
    User.findById(obj, function(err, result) {
      done(err, result);
    });
  });

  function processAuth(accessToken, refreshToken, profile, done) {
    User.findOne({ openid: profile.id }, function(err, result) {
      if (result == null) {
        // Attempt to migrate account from OpenId
        User.findOne({ email: profile.emails[0].value }, function(err, result) {
          if (result == null) {
            // User doesn't exist, create a new one
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
              openid: profile.id,
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
          } else {
            // Migrate user from OpenId
            result.openid = profile.id;
            result.save(function(err, user) {
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

  var strategy = new GoogleStrategy({
    openIDRealm: app.realm,

    clientID: config['google_client_id'],
    clientSecret: config['google_client_secret'],
    callbackURL: app.realm + "auth/google/return"
  }, processAuth);
  passport.use(strategy);

  app.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }), function(req, res) {
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