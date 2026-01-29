const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true
  },
  field1: {
    type: Number,
    required: true
  },
  field2: {
    type: Number,
    required: true
  },
  field3: {
    type: Number,
    required: true
  }
}, {
  timestamps: false //using our own timestamp field
});

// Index for faster date range queries
measurementSchema.index({ timestamp: 1 });

module.exports = mongoose.model('Measurement', measurementSchema);
