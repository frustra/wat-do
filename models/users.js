exports.define = function(db) {
  return db.define("user", {
    "email" : { "type": "string" }
  };
};