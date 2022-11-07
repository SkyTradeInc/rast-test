const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  uuid: String,


  apiKey: {type: String, default: ""},
  secretKey: {type: String, default: ""},
  publicKey: {type: String, default: ""},
  role: {type: String, default: "member"},
});

userSchema.set('timestamps', true)

module.exports = mongoose.model('User', userSchema);
