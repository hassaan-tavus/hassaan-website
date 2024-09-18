const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Function to log calls
function logCall(name, email) {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - Call created - Name: ${name}, Email: ${email}`);
}

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
                "persona_id": "p0c218ac",
                "conversational_context": conversational_context,
                "custom_greeting": custom_greeting,
                "properties":{"max_call_duration":180,"participant_left_timeout":0}
            })
        });

        const data = await response.json();

        if (data.conversation_url) {
            // Log the call
            logCall(name, email);
            res.json({ meeting_link: data.conversation_url });
        } else {
            console.error('No meeting link in the response:', data);
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