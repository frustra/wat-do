var mongoose = require('mongoose')
  , ObjectId = mongoose.Schema.ObjectId;

var itemSchema = new mongoose.Schema({
  name: String,
  desc: String,
  createdAt: Date,
  start: Date,
  end: Date,
  user: { type: ObjectId, ref: 'User' },
  list: { type: ObjectId, ref: 'List' },
  completed: [ObjectId],
  comments: [{ type: ObjectId, ref: 'Comment' }]
});

itemSchema.statics.clientObjects = function(items, user) {
  var tmp = [];
  for (var i = 0; i < items.length; i++) {
    tmp[i] = items[i].toObject();
    tmp[i].done = user ? items[i].completed.indexOf(user) >= 0 : false;
    if (tmp[i].user && tmp[i].user._id) tmp[i].user = tmp[i].user._id;
    if (tmp[i].list && tmp[i].list._id) tmp[i].list = tmp[i].list._id;
    tmp[i].user = tmp[i].user ? ((user && tmp[i].user.equals(user)) ? undefined : tmp[i].user) : undefined;
    tmp[i].list = tmp[i].user ? undefined : tmp[i].list;
    tmp[i].completed = undefined;
  }
  return tmp;
}

itemSchema.methods.clientObject = function(user) {
  var tmp = this.toObject();
  tmp.done = user ? this.completed.indexOf(user) >= 0 : false;
  if (tmp.user && tmp.user._id) tmp.user = tmp.user._id;
  if (tmp.list && tmp.list._id) tmp.list = tmp.list._id;
  tmp.user = tmp.user ? ((user && tmp.user.equals(user)) ? undefined : tmp.user) : undefined;
  tmp.list = tmp.user ? undefined : tmp.list;
  tmp.completed = undefined;
  return tmp;
}

itemSchema.methods.setDone = function(done, user) {
  if (done === 'true') {
    if (this.completed.indexOf(user) < 0) this.completed.push(user);
  } else this.completed.remove(user);
}

exports.Item = mongoose.model('Item', itemSchema);