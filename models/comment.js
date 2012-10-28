var mongoose = require('mongoose')
  , ObjectId = mongoose.Schema.ObjectId;

var commentSchema = new mongoose.Schema({
  message: String,
  createdAt: Date,
  creator: { type: ObjectId, ref: 'User' },
  item: { type: ObjectId, ref: 'Item' }
});

exports.Comment = mongoose.model('Comment', commentSchema);
