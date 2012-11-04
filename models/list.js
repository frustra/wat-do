var mongoose = require('mongoose')
  , ObjectId = mongoose.Schema.ObjectId;

/*
 * Permissions for list members:
 * 0: Can view
 * 1: Can edit
 * 2: Can admin
 */
var listSchema = new mongoose.Schema({
  name: String,
  public: Boolean,
  owner: { type: ObjectId, ref: 'User' },
  members: [{ permission: Number, user: { type: ObjectId, ref: 'User' } }],
  items: [{ type: ObjectId, ref: 'Item' }]
});

exports.List = mongoose.model('List', listSchema);
