const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  }
}, {
  collection: 'tokens'
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
