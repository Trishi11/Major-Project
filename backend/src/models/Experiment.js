const mongoose = require('mongoose');

const experimentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  chemicals: [{
    name: String,
    formula: String,
    quantity: String
  }],
  procedure: [{
    step: Number,
    description: String
  }],
  safetyNotes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Experiment', experimentSchema);