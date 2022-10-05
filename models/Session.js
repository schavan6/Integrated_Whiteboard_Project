const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  sessionname: {
    type: String,
    required: true
  },
  hostname: {
    type: String,
    required: true
  },
  hostid: {
    type: String,
    required: true
  },
  isstarted: {
    type: Boolean,
    required: true
  },
  startdatetime: {
    type: Date,
    required: true
  },
  isended: {
    type: Boolean,
    required: true
  }
});

const Session = mongoose.model('Session', SessionSchema);
module.exports = Session;