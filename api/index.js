const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Function to log calls and send data to Google Sheet
// Log the call and send data to Google Sheet
            /*
            1. Create a Google Sheet to store the email addresses.
            2. Set up a Google Apps Script:
                In your Google Sheet, go to Tools > Script editor
                Replace the content with the following code:
                    function doPost(e) {
                    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
                    var data = JSON.parse(e.postData.contents);
                    sheet.appendRow([new Date(), data.name, data.email, data.meetingUrl]);
                    return ContentService.createTextOutput(JSON.stringify({result: 'success'})).setMimeType(ContentService.MimeType.JSON);
                    }
            3. Deploy the script:
                Click on Deploy > New deployment
                Select 'Web app' as the type
                Set 'Execute as' to your Google account
                Set 'Who has access' to 'Anyone'
                Click 'Deploy' and copy the Web app URL
                Add the Google Sheet URL to your .env file: GOOGLE_SHEET_URL=
            */
async function logCallAndSendToSheet(name, email, meetingUrl) {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - Call created - Name: ${name}, Email: ${email}, Meeting URL: ${meetingUrl}`);

    // Send data to Google Sheet
    const sheetUrl = process.env.GOOGLE_SHEET_URL;
    try {
        const response = await fetch(sheetUrl, {
            method: 'POST',
            body: JSON.stringify({ name, email, meetingUrl }),
            headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();
        console.log('Data sent to Google Sheet:', result);
    } catch (error) {
        console.error('Error sending data to Google Sheet:', error);
    }
}

// Function to create a conversation with a Tavus digital twin
app.post('/create-video-call', async (req, res) => {
    const { name, email } = req.body;
    
    try {
        let conversational_context = '';
        conversational_context = 'You are talking to: ' + name;
       
        const custom_greeting = `Howdy ${name}, I'm Hasan! How are you doing today?`;

        const response = await fetch('https://tavusapi.com/v2/conversations', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.TAVUS_API_KEY
            },
            body: JSON.stringify({
                // Persona ID for 70B - p0c218ac
                // Persona ID for 8B - pcddd5a6
                "persona_id": "p0c218ac",
                "conversational_context": conversational_context,
                "custom_greeting": custom_greeting,
                "properties":{"max_call_duration":180,"participant_left_timeout":0}
            })
        });

        const data = await response.json();

        if (data.conversation_url) {
            await logCallAndSendToSheet(name, email, data.conversation_url);
            res.json({ meeting_link: data.conversation_url });
        } else {
            console.error('No meeting link in the response:', data);
            await logCallAndSendToSheet(name, email, 'FAILED: No meeting link in the response');
            res.status(500).json({ error: 'No meeting link in the response' });
        }
    } catch (error) {
        console.error('Error:', error);
        await logCallAndSendToSheet(name, email, `FAILED: ${error.message}`);
        res.status(500).json({ error: 'An error occurred while creating the conversation' });
    }
});

// For investor dojo demo page
let investorData;
fs.readFile(path.join(__dirname, 'demo-investors.json'), 'utf8')
    .then(data => {
        investorData = JSON.parse(data);
    })
    .catch(err => {
        console.error('Error reading investors.json:', err);
        process.exit(1);
    });

// Function to create a conversation for YC demo day joke call
app.post('/api/create-demo-investor-dojo-call', async (req, res) => {
    try {
        const { name, email } = req.body;
        
        // insert code here
        let conversational_context = '';
        if (investorData[email] && investorData[email].about_them) {
            conversational_context = 'This is who you will be talking to: ' + investorData[email].about_them;
        } else {
            conversational_context = 'You are talking to an investor named: ' + name;
        }

        const custom_greeting = `Howdy ${name}, welcome to Hassaan's Dojo! How are you doing today?`;

        const response = await fetch('https://tavusapi.com/v2/conversations', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.TAVUS_API_KEY
            },
            body: JSON.stringify({
                "persona_id": "p1da6a55",
                "conversational_context": conversational_context,
                "custom_greeting": custom_greeting,
                "properties":{"max_call_duration":420,"participant_left_timeout":0}
            })
        })

        const data = await response.json();

        if (data.conversation_url) {
            await logCallAndSendToSheet('investor-dojo' + ' ' + name, email, data.conversation_url);
            res.json({ meeting_link: data.conversation_url });
        } else {
            console.error('No meeting link in the response:', data);
            await logCallAndSendToSheet('investor-dojo' + ' ' + name, email, 'FAILED: No meeting link in the response');
            res.status(500).json({ error: 'No meeting link in the response' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while creating the conversation' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;