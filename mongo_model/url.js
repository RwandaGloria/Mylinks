const mongoose = require('mongoose');

const URLSchema = new mongoose.Schema({
  longURL: {
    type: String,
    required: true
  },
  shortURL: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  linkClickCount: {
    type: Number,
    default: 0
  },
  QRCodeImage: {
    type: String,
    required: true
  }
}, {
  collection: 'URLs'
});

const URL = mongoose.model('URL', URLSchema);

module.exports = URL;
