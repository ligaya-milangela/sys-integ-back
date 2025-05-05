const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const session = require('cookie-session');
const googleRoutes = require('./routes/googleRoutes');
const notesRoutes = require('./routes/notes_route');
const attendanceRoute = require('./routes/attendance_route');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// Session handling
app.use(session({
  name: 'session',  
  keys: [process.env.SESSION_SECRET || 'default_key'],  
  maxAge: 24 * 60 * 60 * 1000,  
}));

// Routes
app.use('/auth', googleRoutes);  
app.use('/api/notes', notesRoutes);
app.use('/api/attendance', attendanceRoute);


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Start the server
app.listen(process.env.PORT || 5003, () => {
  console.log(`Server running on port ${process.env.PORT || 5003}`);
});

app.get('/', (req, res) => {
  res.send('Backend is working!');
});