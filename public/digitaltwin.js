let scene, camera, renderer, grid;
let isMuted = false;
let meetingLink = null;
let terminalOutput;
let isUnlimited = false;

function init() {
    // Check if the URL has the 'unlimited' parameter
    const urlParams = new URLSearchParams(window.location.search);
    isUnlimited = urlParams.get('unlimited') === 'true';

    // Update the title if it's unlimited
    if (isUnlimited) {
        document.getElementById('ai-title').textContent = 'Hassaan OS v1.0 (Secret Unlimited Version)';
    }

    // Rest of the init function...
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('grid-container').appendChild(renderer.domElement);

    // Create a larger grid with bigger squares
    const size = 20000;
    const divisions = 100; // Reduced divisions for larger squares
    grid = new THREE.GridHelper(size, divisions, 0x00ff00, 0x00ff00);
    grid.position.z = 0;
    grid.position.y = -500; // Lower the grid to ensure it covers the bottom
    scene.add(grid);

    // Add fog to create depth effect
    scene.fog = new THREE.Fog(0x000000, 200, 5000);

    // Adjust camera position and angle
    camera.position.set(0, 100, 1000);
    camera.lookAt(0, -200, -2000);

    animate();
}

function createCall(name, email) {
    terminalOutput.innerHTML += `<div class="command-line">CREATING VIDEO CALL...</div>`;
    fetch('/create-video-call', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, isUnlimited }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error(`Error: ${data.error}`);
            terminalOutput.innerHTML += `<div class="command-line">ERROR: FAILED TO CREATE VIDEO CALL</div>`;
        } else if (data.meeting_link) {
            meetingLink = data.meeting_link;
            terminalOutput.innerHTML += `<div class="command-line">VIDEO CALL CREATED SUCCESSFULLY</div>`;
            const skipButton = document.getElementById('skip-button');
            skipButton.style.display = 'inline-block';
        } else {
            console.error('No meeting link received');
            terminalOutput.innerHTML += `<div class="command-line">ERROR: NO MEETING LINK RECEIVED</div>`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        terminalOutput.innerHTML += `<div class="command-line">ERROR: FAILED TO CREATE VIDEO CALL</div>`;
    });
}

function joinCall() {
    if (meetingLink) {
        window.location.href = meetingLink;
    } else {
        console.error('No meeting link available');
        terminalOutput.innerHTML += `<div class="command-line">ERROR: NO MEETING LINK AVAILABLE</div>`;
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Move the grid towards the camera (slower speed)
    grid.position.z += 2; // Reduced speed from 5 to 2
    if (grid.position.z > 2000) {
        grid.position.z = 0;
    }

    renderer.render(scene, camera);
}

// Wrap the init() call in a DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    init();
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

document.getElementById('launch-call').addEventListener('click', () => {
    // Hide the "Talk to Digital Twin" box
    document.getElementById('content-overlay').style.display = 'none';

    // Show terminal overlay
    const terminalOverlay = document.getElementById('terminal-overlay');
    terminalOverlay.style.display = 'flex';

    // Simulate terminal commands
    const terminalContent = document.getElementById('terminal-content');
    terminalContent.innerHTML = `
        <div id="terminal-title-bar">
            <span>Terminal</span>
            <button id="close-terminal">x</button>
        </div>
        <div id="terminal-body">
            <div class="terminal-path">]</div>
            <div id="terminal-output"></div>
        </div>
        <div id="terminal-status-bar">
            <div class="terminal-controls">
                <button id="mute-button">Mute Sound</button>
                <button id="skip-button" style="display: none;">Skip the fun, join the call</button>
            </div>
        </div>
    `;

    terminalOutput = document.getElementById('terminal-output');
    const muteButton = document.getElementById('mute-button');
    const skipButton = document.getElementById('skip-button');
    const closeButton = document.getElementById('close-terminal');
    const terminalControls = document.querySelector('.terminal-controls');

    muteButton.addEventListener('click', () => {
        isMuted = !isMuted;
        muteButton.textContent = isMuted ? 'Unmute Sound' : 'Mute Sound';
        const dialupSound = document.getElementById('dialup-sound');
        dialupSound.muted = isMuted;
    });

    closeButton.addEventListener('click', () => {
        terminalOverlay.style.display = 'none';
        document.getElementById('content-overlay').style.display = 'block';
    });

    skipButton.addEventListener('click', () => {
        const name = terminalOutput.querySelector('.command-line:nth-last-child(2)').textContent;
        const email = terminalOutput.querySelector('.command-line:last-child').textContent;
        joinCall(name, email);
    });

    function typeText(text, callback) {
        let i = 0;
        function type() {
            if (i < text.length) {
                terminalOutput.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, 10); // Faster typing speed
            } else {
                terminalOutput.innerHTML += '<br>';
                if (callback) setTimeout(callback, 100);
            }
        }
        type();
    }

    function startApplication() {
        terminalOutput.innerHTML += '<div class="command-line">]RUN HASSAAN_AI</div>';
        terminalOutput.innerHTML += '<div class="command-line">LOADING HASSAAN_AI...</div>';
        
        setTimeout(() => {
            typeText("YOU'LL BE CHATTING WITH AI HASSAAN IN JUST A MOMENT.", () => {
                typeText('REMEMBER YOU CAN ALWAYS BUILD YOUR OWN APP WITH DIGITAL TWINS USING TAVUS (WWW.TAVUS.IO)', () => {
                    typeText('TO PREVENT SPAM PLEASE PROVIDE THE FOLLOWING INFO:', () => {
                            setTimeout(askName, 500);
                    });
                });
            });
        }, 500);
    }

    function askName() {
        terminalOutput.innerHTML += `<div class="command-line">PLEASE ENTER YOUR NAME:</div>`;
        const inputContainer = document.createElement('div');
        inputContainer.className = 'input-container';
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'terminal-input';
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Enter';
        submitButton.className = 'submit-button';
        inputContainer.appendChild(input);
        inputContainer.appendChild(submitButton);
        terminalOutput.appendChild(inputContainer);
        input.focus();

        function handleSubmit() {
            const name = input.value;
            terminalOutput.removeChild(inputContainer);
            terminalOutput.innerHTML += `<div class="command-line">${name.toUpperCase()}</div>`;
            
            if (name.toLowerCase() === 'hassaan') {
                terminalOutput.innerHTML += `<div class="command-line">ACCESS DENIED! IMPOSTER DETECTED!</div>`;
                setTimeout(askName, 1000); // Ask for the name again after a short delay
            } else {
                askEmail(name);
            }
        }

        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSubmit();
            }
        });

        submitButton.addEventListener('click', handleSubmit);
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function askEmail(name) {
        function promptEmail() {
            terminalOutput.innerHTML += `<div class="command-line">PLEASE ENTER YOUR EMAIL:</div>`;
            const inputContainer = document.createElement('div');
            inputContainer.className = 'input-container';
            const input = document.createElement('input');
            input.type = 'email';
            input.className = 'terminal-input';
            const submitButton = document.createElement('button');
            submitButton.textContent = 'Enter';
            submitButton.className = 'submit-button';
            inputContainer.appendChild(input);
            inputContainer.appendChild(submitButton);
            terminalOutput.appendChild(inputContainer);
            input.focus();

            function handleSubmit() {
                const email = input.value;
                if (isValidEmail(email)) {
                    terminalOutput.removeChild(inputContainer);
                    terminalOutput.innerHTML += `<div class="command-line">${email.toUpperCase()}</div>`;
                    terminalControls.style.display = 'flex';
                    startConnection(name, email);
                } else {
                    terminalOutput.removeChild(inputContainer);
                    terminalOutput.innerHTML += `<div class="command-line">${email.toUpperCase()}</div>`;
                    terminalOutput.innerHTML += `<div class="command-line">INVALID EMAIL. ENTER A REAL EMAIL TO PROVE YOU ARE HUMAN.</div>`;
                    promptEmail(); // Prompt for email again
                }
            }

            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleSubmit();
                }
            });

            submitButton.addEventListener('click', handleSubmit);
        }

        promptEmail(); // Initial email prompt
    }

    skipButton.addEventListener('click', () => {
        const name = terminalOutput.querySelector('.command-line:nth-last-child(2)').textContent;
        const email = terminalOutput.querySelector('.command-line:last-child').textContent;
        joinCall(name, email);
    });

    function startConnection(name, email) {
        // Play dial-up sound
        const dialupSound = document.getElementById('dialup-sound');
        if (!isMuted) {
            dialupSound.play();
        }

        // Create the call
        createCall(name, email);

        const commands = [
            'DIALING...',
            'INITIALIZING CONNECTION...',
            'ESTABLISHING SECURE CHANNEL...',
            `VERIFYING CREDENTIALS FOR ${name.toUpperCase()}...`,
            'SPINNING UP MONEY INCINERATOR (GPU)...',
            'LOADING AI HASSAAN...',
            'SETTING HONESTY = 95% HUMOR = 60%...',
            'CONNECTION ESTABLISHED! REDIRECTING TO VIDEO STREAM...'
        ];

        let i = 0;
        function typeCommand() {
            if (i < commands.length) {
                terminalOutput.innerHTML += `<div class="command-line">${commands[i]}</div>`;
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
                i++;
                if (i === 1) {
                    setTimeout(typeCommand, 3000); // Wait 3 seconds after "DIALING..."
                } else {
                    setTimeout(typeCommand, 2000); // Wait 2 seconds between other commands
                }
            } else {
                setTimeout(() => {
                    if (meetingLink) {
                        joinCall();
                    } else {
                        terminalOutput.innerHTML += `<div class="command-line">WAITING FOR MEETING LINK...</div>`;
                    }
                }, 500);
            }
        }

        typeCommand();
    }

    startApplication();
});