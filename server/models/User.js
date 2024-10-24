const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // You should hash this in production
});

module.exports = mongoose.model('User', UserSchema);
