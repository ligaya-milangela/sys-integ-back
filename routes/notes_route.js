const express = require('express');
const router = express.Router();
const Note = require('../models/notes_model');  
const Attendance = require('../models/attendance_model');
const User = require('../models/user_model'); // Import your User model
// const { getAttendanceById } = require('./attendanceService');
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(req.params.id).populate('attendees', 'name');;  
    console.log(note)
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });  
    }
    res.json(note);  
  } catch (err) {
    res.status(500).json({ error: err.message });  
  }
});

router.get('/', async (req, res) => {
  try {
    const notes = await Note.find();  
    res.json(notes);  
  } catch (err) {
    res.status(500).json({ error: err.message });  
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, content, isMinute, attendanceId } = req.body;

    let attendees = [];

    if (attendanceId) {
      const attendanceRecord = await Attendance.findById(attendanceId);
      if (!attendanceRecord) {
        return res.status(404).json({ error: 'Attendance record not found' });
      }

      attendees = attendanceRecord.attendees; 
    }

    const newNote = new Note({
      title,
      content,
      isMinute,
      attendees,
    });

    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (err) {
    console.error('Error creating note:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { attendees } = req.body;
    console.log(attendees)
    const { id } = req.params;
    if (attendees && Array.isArray(attendees)) {
      // Find users by name and get their ObjectIds
      const users = await User.find({ _id: { $in: attendees } }, '_id');
      const userIds = users.map(user => user._id);

      req.body.attendees = userIds;
     
    }
    
    const updatedNote = await Note.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(updatedNote);  
  } catch (err) {
    console.error('Error updating note:', err);
    res.status(500).json({ error: err.message });
  }
});


router.patch('/:id/submit', async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(req.params.id, { status: 'Submitted for Approval' }, { new: true });
    if (!updatedNote) {
      return res.status(404).json({ error: 'Note not found' });  
    }
    res.json(updatedNote);  
  } catch (err) {
    res.status(500).json({ error: err.message });  
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);  
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });  
    }
    res.json({ message: 'Note deleted successfully' });  
  } catch (err) {
    res.status(500).json({ error: err.message });  
  }
});

module.exports = router;  
