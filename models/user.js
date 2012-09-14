var mongoose = require('mongoose')
  , ObjectId = mongoose.Schema.ObjectId;

var UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  openid: String,
  createdAt: Date
});

exports.User = mongoose.model('User', UserSchema);