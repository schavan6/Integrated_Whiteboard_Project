const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  hostname: {
    type: String,
    required: true
  },
  hostid: {
    type: String,
    required: true
  },
  sessionname: {
    type: String,
    required: true
  }
});

const Session = mongoose.model('Session', SessionSchema);
module.exports = Session;