const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    unique: true
  },
  userName: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false
  } 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
