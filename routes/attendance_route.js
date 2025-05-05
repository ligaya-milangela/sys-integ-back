const express = require('express');
const router = express.Router();
const Attendance = require('../models/attendance_model');
const User = require('../models/user_model'); // Adjust based on your file structure

router.post('/create', async (req, res) => {

  const { meeting_date, attendees, created_by } = req.body;

  // Validate required fields
  if (!meeting_date || !attendees || !created_by) {
    return res.status(400).json({ error: "Meeting date, attendees, and created_by are required." });
  }

  try {
    const date = new Date(meeting_date);
    if (isNaN(date)) {
      return res.status(400).json({ error: "Invalid meeting date." });
    }

    // Fetch ObjectIds for attendees from the User model
    const attendeesIds = await User.find({ name: { $in: attendees } })
                                   .select('_id'); // Get only the _id field

    if (attendeesIds.length !== attendees.length) {
      return res.status(400).json({ error: "Some attendees not found in the system." });
    }

    // Map the fetched attendees to their ObjectIds
    const attendeeObjectIds = attendeesIds.map(user => user._id);

    // Create the Attendance document
    const attendance = new Attendance({
      meeting_date: date, 
      attendees: attendeeObjectIds,
      created_by,
    });

    await attendance.save();
    res.status(201).json({ message: 'Attendance saved successfully.' });
  } catch (err) {
    console.error('Error saving attendance:', err); 
    res.status(500).json({ error: 'Failed to save attendance: ' + err.message });
  }
});

// Get all attendance dates
router.get('/list', async (req, res) => {
  try {
    const records = await Attendance.find({}, 'meeting_date');
    res.json(records);
  } catch (err) {
    console.error('Error fetching attendance list:', err);
    res.status(500).json({ error: 'Failed to fetch attendance list' });
  }
});

// Get attendees for a specific date using /:id
router.get('/:id', async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Attendance record not found.' });
    }
    res.json(record);
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});
router.get('/details/:id', async (req, res) => {
  try {
    const attendanceId = req.params.id;
    const attendanceDetails = await Attendance.findById(attendanceId)
      .populate('attendees', 'name'); // populate only the `name` field

    if (!attendanceDetails) {
      return res.status(404).json({ message: 'Attendance details not found' });
    }

    res.json(attendanceDetails);
  } catch (error) {
    console.error('Error fetching attendance details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an attendance record by ID
router.delete('/:id', async (req, res) => {
  try {
    const attendanceId = req.params.id;

    const attendance = await Attendance.findByIdAndDelete(attendanceId);

    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found.' });
    }

    res.status(200).json({ message: 'Attendance deleted successfully.' });
  } catch (err) {
    console.error('Error deleting attendance:', err);
    res.status(500).json({ error: 'Failed to delete attendance' });
  }
});


module.exports = router;
