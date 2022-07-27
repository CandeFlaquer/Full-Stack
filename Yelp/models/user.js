const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

//Schema
const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true, //not a validation, it just sets up an index
  },
});
UserSchema.plugin(passportLocalMongoose);
/* We dont specify user n pass because we use UserSchema.plugin(passportLocalMongoose), this will add a unique username a field for pass, to our Schema */

module.exports = mongoose.model("User", UserSchema);
