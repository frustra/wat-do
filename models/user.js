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

userSchema.methods.clientObject = function() {
  var tmp = this.toObject();
  tmp.openid = undefined;
  tmp.items = undefined;
  return tmp;
}

exports.User = mongoose.model('User', userSchema);