const mongoose = require('mongoose');

const clickDataSchema = new mongoose.Schema({
  link_id: {
    type: String,
    default: () => mongoose.Types.ObjectId().toString()
  },
  Country: {
    type: String,
    required: false
  },
  state: {
    type: String,
    required: false
  },
  clickTime: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'clickdata'
});

const ClickData = mongoose.model('ClickData', clickDataSchema);

module.exports = ClickData;
