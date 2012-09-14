var mongoose = require('mongoose')
  , ObjectId = mongoose.Schema.ObjectId;

var CategorySchema = new mongoose.Schema({
  name: String,
  public: Boolean,
  owner: { type: ObjectId, ref: 'User' }
});

exports.Category = mongoose.model('Category', CategorySchema);
