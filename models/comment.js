var mongoose = require('mongoose')
  , ObjectId = mongoose.Schema.ObjectId;

var commentSchema = new mongoose.Schema({
  message: String,
  createdAt: Date,
  creator: { type: ObjectId, ref: 'User' }
});

exports.Comment = mongoose.model('Comment', commentSchema);
