const { google } = require('googleapis');

// Google OAuth Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar',
];


// Initiates Google OAuth flow
const googleOAuthStart = (req, res) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    res.redirect(url);
  };
  
// Google OAuth callback logic
const googleOAuthCallback = async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    req.session.tokens = tokens; // Save tokens in session
    res.redirect('/auth/create-meeting');
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    res.status(500).send('Failed to exchange token');
  }
};
const createMeeting = async (req, res) => {
    if (!req.session.tokens) return res.status(401).send('Not authenticated');
  
    oauth2Client.setCredentials(req.session.tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
    const event = {
      summary: 'Team Meeting',
      description: 'Created via Google Calendar API',
      start: {
        dateTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
        timeZone: 'UTC',
      },
      conferenceData: {
        createRequest: {
          requestId: 'meet-' + Date.now(),
          conferenceSolutionKey: {
            type: 'hangoutsMeet', // Only works with Workspace accounts
          },
        },
      },
    };
  
    try {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1, 
      });
  
      const meetingLink = response.data.hangoutLink;
      res.send(`Google Meet link: <a href="${meetingLink}" target="_blank">${meetingLink}</a>`);
    } catch (error) {
      console.error('Error creating meeting:', error.response?.data || error.message);
      res.status(500).send('Failed to create meeting');
    }
  };
  

module.exports = {
    googleOAuthStart,
    googleOAuthCallback,
    createMeeting
  };
  