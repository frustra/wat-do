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

itemSchema.statics.clientObjects = function(items, user, subbed) {
  var tmp = [];
  for (var i = 0; i < items.length; i++) {
    tmp[i] = items[i].toObject();
    tmp[i].done = (user && (items[i].completed.indexOf(user) >= 0)) || (!subbed && (items[i].end.getTime() <= Date.now()));
    if (tmp[i].user) {
      if (tmp[i].user._id) {
        tmp[i].user = {_id: tmp[i].user._id, name: tmp[i].user.name + '\'s List'};
      } else tmp[i].user = {_id: tmp[i].user, name: ''};
    }
    if (tmp[i].list) {
      if (tmp[i].list._id) {
        tmp[i].list = {_id: tmp[i].list._id, name: tmp[i].list.name};
      } else tmp[i].list = {_id: tmp[i].list, name: ''};
    }
    if (tmp[i].user) {
      if (user && user.equals(tmp[i].user._id)) {
        tmp[i].user.name = 'Your List';
      }
      tmp[i].list = undefined;
    }
    tmp[i].completed = undefined;
  }
  return tmp;
}

itemSchema.methods.clientObject = function(user) {
  var tmp = this.toObject();
  tmp.done = user && (this.completed.indexOf(user) >= 0);
  if (tmp.user) {
    if (tmp.user._id) {
      tmp.user = {_id: tmp.user._id, name: tmp.user.name + '\'s List'};
    } else tmp.user = {_id: tmp.user, name: ''};
  }
  if (tmp.list) {
    if (tmp.list._id) {
      tmp.list = {_id: tmp.list._id, name: tmp.list.name};
    } else tmp.list = {_id: tmp.list, name: ''};
  }
  if (tmp.user) {
    if (user && user.equals(tmp.user._id)) {
      tmp.user.name = 'Your List';
    }
    tmp.list = undefined;
  }
  tmp.completed = undefined;
  return tmp;
}

itemSchema.methods.setDone = function(done, user) {
  if (done === 'true') {
    if (this.completed.indexOf(user) < 0) this.completed.push(user);
  } else this.completed.remove(user);
}

exports.Item = mongoose.model('Item', itemSchema);