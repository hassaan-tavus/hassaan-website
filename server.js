const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static('public'));

app.post('/create-video-call', async (req, res) => {
    const { name, email } = req.body;
    
    try {
        const { name, email } = req.body;
        
        // insert code here
        let conversational_context = '';
        conversational_context = 'This is who you will be talking to: ' + name;
       

        const custom_greeting = `Howdy ${name}, I'm Hassaan's Digital Twin! How are you doing today?`;

        const response = await fetch('https://tavusapi.com/v2/conversations', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.TAVUS_API_KEY
            },
            body: JSON.stringify({
                "persona_id": "pb98b17e",
                "conversational_context": conversational_context,
                "custom_greeting": custom_greeting,
                "properties":{"max_call_duration":10,"participant_left_timeout":0}
            })
        })

        const data = await response.json();

        if (data.conversation_url) {
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