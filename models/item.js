var mongoose = require('mongoose')
  , ObjectId = mongoose.Schema.ObjectId;

var ItemSchema = new mongoose.Schema({
  name: String,
  desc: String,
  createdAt: Date,
  start: Date,
  end: Date,
  completed: [ObjectId]
});

exports.Item = mongoose.model('Item', ItemSchema);
