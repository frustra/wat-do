var mongoose = require('mongoose')
  , ObjectId = mongoose.Schema.ObjectId;

var ItemSchema = new mongoose.Schema({
  name: String,
  desc: String,
  done: Boolean,
  createdAt: Date,
  start: Date,
  end: Date,
  notify: Number, // relative hours

  creator: { type: ObjectId, ref: 'User' },
  collaborators: [{ type: ObjectId, ref: 'User' }],
  categories: [{ type: ObjectId, ref: 'Category' }]
});

exports.Item = mongoose.model('Item', ItemSchema);
