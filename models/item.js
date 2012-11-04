var mongoose = require('mongoose')
  , ObjectId = mongoose.Schema.ObjectId;

var itemSchema = new mongoose.Schema({
  name: String,
  desc: String,
  createdAt: Date,
  start: Date,
  end: Date,
  user: ObjectId,
  list: ObjectId,
  completed: [ObjectId],
  comments: { type: ObjectId, ref: 'Comment' }
});

itemSchema.statics.clientObjects = function(items, user) {
  var tmp = [];
  for (var i = 0; i < items.length; i++) {
    tmp[i] = items[i].toObject();
    tmp[i].done = user ? items[i].completed.indexOf(user) >= 0 : false;
    tmp[i].completed = undefined;
  }
  return tmp;
}

itemSchema.methods.clientObject = function(user) {
  var tmp = this.toObject();
  tmp.done = user ? this.completed.indexOf(user) >= 0 : false;
  tmp.completed = undefined;
  return tmp;
}

itemSchema.methods.setDone = function(done, user) {
  if (done === 'true') {
    this.completed.push(user);
  } else this.completed.remove(user);
}

exports.Item = mongoose.model('Item', itemSchema);