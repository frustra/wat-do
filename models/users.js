exports.define = function(db) {
  return db.define("user", {
  	"name"  : { "type": "string" }
    "email" : { "type": "string" }
  };
};