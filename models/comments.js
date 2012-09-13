exports.define = function(db) {
  var Comment = db.define("comment", {
    "created" : { "type": "date" },
    "message" : { "type": "string" }
  };
  Comment.hasOne("item", Item);
  Comment.hasOne("user", User);
  return category;
};