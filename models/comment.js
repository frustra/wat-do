var mongoose = require('mongoose')
  , ObjectId = mongoose.Schema.ObjectId;

var CommentSchema = new mongoose.Schema({
  message: String,
  createdAt: Date,
  creator: { type: ObjectId, ref: 'User' },
  item: { type: ObjectId, ref: 'Item' }
});

exports.Comment = mongoose.model('Comment', CommentSchema);
