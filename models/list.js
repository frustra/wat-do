var mongoose = require('mongoose')
  , ObjectId = mongoose.Schema.ObjectId;

var ListSchema = new mongoose.Schema({
  name: String,
  public: Boolean,
  owner: { type: ObjectId, ref: 'User' },
  members: [{ permission: Number, { type: ObjectId, ref: 'User' } }],
  items: [{ type: ObjectId, ref: 'Item' }]
});

exports.List = mongoose.model('List', ListSchema);
