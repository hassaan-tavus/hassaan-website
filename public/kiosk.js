// Start face detection when the page loads
window.addEventListener('load', () => {
    startFaceDetection();
});

let faceDetectionInterval = null; // To control the face detection loop
let conversationActive = false;    // Flag to indicate if a conversation is active
let isCallInProgress = false; // New flag to track if a call is already in progress

async function startFaceDetection() {
    // Load the Tiny Face Detector model from local files
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');

    // Create a video element to access the webcam
    const video = document.createElement('video');
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', ''); // Required for iOS
    video.style.display = 'none'; // Hide the video element

    // Request access to the webcam
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            document.body.appendChild(video);
            detectFace(video);
        })
        .catch((err) => {
            console.error('Error accessing webcam:', err);
        });
}

async function detectFace(video) {
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 });

    faceDetectionInterval = setInterval(async () => {
        if (conversationActive) return; // Do not detect faces if a conversation is active

        const result = await faceapi.detectSingleFace(video, options);

        if (result) {
            console.log('Face detected!');
            onFaceDetected();

            // Stop face detection
            stopFaceDetection(video);
        }
    }, 300); // Adjust the interval as needed for optimal performance
}

function stopFaceDetection(video) {
    if (faceDetectionInterval) {
        clearInterval(faceDetectionInterval);
        faceDetectionInterval = null;
    }

    // Stop the webcam stream
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
        video.remove(); // Remove the video element from the DOM
    }
}

let meetingUrl = null; // Store meeting URL once created

function onFaceDetected() {
    if (isCallInProgress) {
        console.log('A call is already in progress. Ignoring new face detection.');
        return;
    }

    isCallInProgress = true;
    conversationActive = true;

    // Start creating the conversation immediately
    createConversation();

    const loopVideo = document.getElementById('loop-video');

    // Function to start the conversation
    const startConversation = () => {
        console.log('Starting conversation');
        if (meetingUrl) {
            initiateConversation();
        } else {
            // If the meeting URL isn't ready yet, wait until it's available
            const checkMeetingUrl = setInterval(() => {
                if (meetingUrl) {
                    clearInterval(checkMeetingUrl);
                    initiateConversation();
                }
            }, 1000);
        }
    };

    // Function to check if the video has completed a loop
    const checkVideoLoop = () => {
        if (loopVideo.currentTime < 0.1) {  // Check if video has just looped
            console.log('Video loop completed');
            loopVideo.removeEventListener('timeupdate', checkVideoLoop);
            startConversation();
        }
    };

    // Start checking for video loop completion
    loopVideo.addEventListener('timeupdate', checkVideoLoop);

    // Fallback: If the video doesn't loop within 30 seconds, start the conversation anyway
    setTimeout(() => {
        if (conversationActive && !meetingUrl) {
            console.log('Video did not loop as expected, starting conversation anyway');
            loopVideo.removeEventListener('timeupdate', checkVideoLoop);
            startConversation();
        }
    }, 30000); // 30 seconds timeout
}

function createConversation() {
    // Create conversation with Tavus
    fetch('/api/create-kiosk-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        if (data.meeting_link) {
            meetingUrl = data.meeting_link;
            console.log('Meeting URL obtained:', meetingUrl);
        } else {
            console.error('Error creating video call:', data.error || data);
            returnToVideoLoop();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        returnToVideoLoop();
    });
}

function initiateConversation() {
    const loopVideo = document.getElementById('loop-video');
    loopVideo.style.display = 'none';

    if (meetingUrl) {
        console.log('Joining daily call');
        joinDailyCall(meetingUrl);
    } else {
        console.error('Meeting URL is not available.');
        // Optionally, you can wait a bit longer or handle the error
        returnToVideoLoop();
    }
}

let callObject = null;

function joinDailyCall(meetingUrl) {
    if (callObject) {
        console.error('Call object already exists. Destroying previous instance.');
        callObject.destroy();
    }

    const dailyContainer = document.getElementById('daily-video-container');
    dailyContainer.style.display = 'block';

    // Stop the loop video and audio
    const loopVideo = document.getElementById('loop-video');
    loopVideo.pause();
    loopVideo.currentTime = 0;

    callObject = DailyIframe.createCallObject();

    // First, get local media
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then((stream) => {
            const videoTrack = stream.getVideoTracks()[0];
            const audioTrack = stream.getAudioTracks()[0];

            if (!videoTrack) {
                throw new Error('No video track available');
            }

            // Create local video element
            const localVideo = document.createElement('video');
            localVideo.id = 'local-video-element';
            localVideo.autoplay = true;
            localVideo.muted = true;
            localVideo.playsInline = true;
            localVideo.srcObject = stream;
            document.getElementById('daily-video-container').appendChild(localVideo);

            // Style the local video (you can adjust these as needed)
            localVideo.style.position = 'absolute';
            localVideo.style.bottom = '10px';
            localVideo.style.right = '10px';
            localVideo.style.width = '20%';
            localVideo.style.height = 'auto';
            localVideo.style.objectFit = 'cover';

            // Join the call with local media
            return callObject.join({ 
                url: meetingUrl,
                audioSource: audioTrack,
                videoSource: videoTrack
            });
        })
        .then(() => {
            console.log('Successfully joined the call');

            // Set up event listeners
            callObject.on('participant-joined', handleParticipantJoined);
            callObject.on('participant-updated', handleParticipantUpdated);
            callObject.on('participant-left', handleParticipantLeft);

            // Optionally, end the call after a certain duration
            setTimeout(() => {
                leaveCall();
            }, 3 * 60 * 1000); // End call after 3 minutes
        })
        .catch((error) => {
            console.error('Error joining call:', error);
            returnToVideoLoop();
        });
}

function handleParticipantJoined(event) {
    console.log('Participant joined:', event);
    const participants = callObject.participants();
    const remoteParticipants = Object.values(participants).filter(p => !p.local);
    
    if (remoteParticipants.length > 0) {
        showDailyCall();
    }
}

function handleParticipantUpdated(event) {
    const participant = event.participant;
    if (participant.session_id !== callObject.participants().local.session_id) {
        // This is a remote participant
        if (participant.videoTrack) {
            const videoElement = document.getElementById('remote-video-element');
            videoElement.srcObject = new MediaStream([participant.videoTrack]);
            showDailyCall();
        }
        if (participant.audioTrack) {
            const audioElement = document.getElementById('remote-audio-element');
            audioElement.srcObject = new MediaStream([participant.audioTrack]);
        }
    }
}

function handleParticipantLeft(event) {
    console.log('Participant left:', event);
    const participants = callObject.participants();
    const remoteParticipants = Object.values(participants).filter(p => !p.local);
    
    if (remoteParticipants.length === 0) {
        leaveCall();
    }
}

function showDailyCall() {
    const loopVideo = document.getElementById('loop-video');
    loopVideo.style.display = 'none';
    
    const dailyContainer = document.getElementById('daily-video-container');
    dailyContainer.style.display = 'block';
}

function leaveCall() {
    if (callObject) {
        callObject.leave()
        .then(() => {
            callObject.destroy();
            callObject = null;
            const dailyContainer = document.getElementById('daily-video-container');
            dailyContainer.style.display = 'none';
            // Remove the local video element
            const localVideo = document.getElementById('local-video-element');
            if (localVideo) {
                localVideo.srcObject.getTracks().forEach(track => track.stop());
                localVideo.remove();
            }
            returnToVideoLoop();
        })
        .catch((error) => {
            console.error('Error leaving call:', error);
            returnToVideoLoop();
        });
    } else {
        returnToVideoLoop();
    }
}

function returnToVideoLoop() {
    const loopVideo = document.getElementById('loop-video');
    loopVideo.currentTime = 0;
    loopVideo.style.display = 'block';
    loopVideo.play();

    const dailyContainer = document.getElementById('daily-video-container');
    dailyContainer.style.display = 'none';

    // Reset variables
    meetingUrl = null;
    conversationActive = false;
    isCallInProgress = false; // Reset the call in progress flag

    // Restart face detection
    startFaceDetection();
}
