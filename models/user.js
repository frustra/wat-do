var mongoose = require('mongoose')
  , ObjectId = mongoose.Schema.ObjectId;

var userSchema = new mongoose.Schema({
  name: String,
  email: String,
  openid: String,
  createdAt: Date,
  public: Boolean,
  items: [{ type: ObjectId, ref: 'Item' }]
});

exports.User = mongoose.model('User', userSchema);