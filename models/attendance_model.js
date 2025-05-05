const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  meeting_date: {
    type: Date,
    required: true
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  }],
  created_by: {
    type: String,  
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
