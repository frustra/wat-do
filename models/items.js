exports.define = function(db) {
  var Item = db.define("item", {
    "name"   : { "type": "string" },
    "desc"   : { "type": "string" },
    "done"   : { "type": "boolean" },
    "start"  : { "type": "date" },
    "end"    : { "type": "date" },
    "notify" : { "type": "int" } // If > 0 then hours after start, if < 0 then hours before end, else none
  };
  Item.hasOne("user", User);
  Item.hasMany("categories", Category, "category");
  return Item;
};