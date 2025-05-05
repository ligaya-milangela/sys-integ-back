const express = require('express');
const router = express.Router();
const { googleOAuthCallback, createMeeting, googleOAuthStart } = require('../controllers/googleController.js');

// Google OAuth callback route
router.get('/google/callback', googleOAuthCallback);

// Google Meet creation route
router.get('/create-meeting', createMeeting);

router.get('/google', googleOAuthStart);
module.exports = router;
