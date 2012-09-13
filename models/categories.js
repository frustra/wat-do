exports.define = function(db) {
  var Category = db.define("category", {
    "name"   : { "type": "string" },
    "public" : { "type": "boolean" }
  };
  Category.hasOne("user", User);
  return category;
};