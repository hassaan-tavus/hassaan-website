// Start face detection when the page loads
window.addEventListener('load', () => {
    startFaceDetection();
});

let faceDetectionInterval = null; // To control the face detection loop
let conversationActive = false;    // Flag to indicate if a conversation is active

async function startFaceDetection() {
    // Load the Tiny Face Detector model
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models'); // Ensure models are available at /models

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
    conversationActive = true; // Set the flag to indicate a conversation is active

    // Start creating the conversation immediately
    createConversation();

    const loopVideo = document.getElementById('loop-video');

    // Wait for the loop video to finish the current iteration
    const onVideoEnded = () => {
        loopVideo.removeEventListener('ended', onVideoEnded);

        if (meetingUrl) {
            // Join the conversation only after the loop video ends
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

    // If the video is playing, wait for it to end
    if (!loopVideo.paused && !loopVideo.ended) {
        loopVideo.addEventListener('ended', onVideoEnded);
    } else {
        // If the video is paused or already ended, initiate conversation immediately
        onVideoEnded();
    }
}

function createConversation() {
    // Create conversation with Tavus
    fetch('/api/create-kiosk-call', {  // Updated endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // No need to send name or email
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        if (data.meeting_link) {
            meetingUrl = data.meeting_link; // Store the meeting URL
            console.log('Meeting URL obtained:', meetingUrl);
        } else {
            console.error('Error creating video call:', data.error || data);
            // Handle error, e.g., show a message or retry
            returnToVideoLoop();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle error
        returnToVideoLoop();
    });
}

function initiateConversation() {
    const loopVideo = document.getElementById('loop-video');
    loopVideo.style.display = 'none';

    if (meetingUrl) {
        joinDailyCall(meetingUrl);
    } else {
        console.error('Meeting URL is not available.');
        // Optionally, you can wait a bit longer or handle the error
        returnToVideoLoop();
    }
}

function joinDailyCall(meetingUrl) {
    const dailyContainer = document.getElementById('daily-container');
    dailyContainer.style.display = 'block';

    const callFrame = window.DailyIframe.createFrame(dailyContainer, {
        iframeStyle: {
            width: '100%',
            height: '100%',
            border: '0',
        },
        showLeaveButton: false,
        showFullscreenButton: false,
        showLocalVideo: false,
        showParticipantsBar: false,
        userName: 'Kiosk',
    });

    callFrame.join({ url: meetingUrl })
    .then(() => {
        // Mute local audio and video
        callFrame.setLocalAudio(false);
        callFrame.setLocalVideo(false);

        // Listen for meeting end
        callFrame.on('left-meeting', () => {
            callFrame.destroy();
            dailyContainer.style.display = 'none';
            returnToVideoLoop();
        });

        // Optionally, end the call after a certain duration
        setTimeout(() => {
            callFrame.leave();
        }, 3 * 60 * 1000); // End call after 3 minutes
    });
}

function returnToVideoLoop() {
    const loopVideo = document.getElementById('loop-video');
    loopVideo.currentTime = 0;
    loopVideo.style.display = 'block';
    loopVideo.play();

    // Reset variables
    meetingUrl = null;
    conversationActive = false;

    // Restart face detection
    startFaceDetection();
}
