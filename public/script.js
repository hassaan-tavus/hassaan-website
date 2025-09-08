// Hassaan OS - Simple Working Version
console.log('Loading Hassaan OS...');

// Digital Twin Chat functionality - Make globally available
window.openTerminal = function() {
    console.log('Opening AI Chat app...');
    showWindow('digitaltwin-app');
};

window.closeTerminal = function() {
    console.log('Closing AI Chat app...');
    hideWindow('digitaltwin-app');
};

function setupDock() {
    console.log('Setting up dock...');
    
    const dockItems = document.querySelectorAll('.dock-item');
    console.log('Dock items found:', dockItems.length);
    
    dockItems.forEach((item, i) => {
        console.log(`Dock item ${i}:`, item.getAttribute('data-app'));
        
        item.onclick = function(e) {
            console.log('DOCK CLICKED!', this.getAttribute('data-app'));
            e.preventDefault();
            
            const app = this.getAttribute('data-app');
            
            if (app === 'about') {
                showWindow('about-app');
            } else if (app === 'interests') {
                showWindow('interests-app');
            } else if (app === 'digitaltwin') {
                showWindow('digitaltwin-app');
                setTimeout(() => {
                    if (window.startTerminalSequence) {
                        window.startTerminalSequence();
                    }
                }, 300);
            } else if (app === 'writing') {
                window.location.href = '/writing';
            }
        };
    });
    
    // Close buttons
    const closeBtns = document.querySelectorAll('.close-btn');
    console.log('Close buttons found:', closeBtns.length);
    
    closeBtns.forEach((btn, i) => {
        console.log(`Close button ${i}:`, btn.getAttribute('data-app'));
        
        btn.onclick = function(e) {
            console.log('CLOSE CLICKED!', this.getAttribute('data-app'));
            e.preventDefault();
            e.stopPropagation();
            
            const app = this.getAttribute('data-app');
            hideWindow(app + '-app');
        };
    });
    
    // Setup desktop buttons
    const launchCallBtn = document.getElementById('launch-call');
    if (launchCallBtn) {
        launchCallBtn.onclick = function() {
            showWindow('digitaltwin-app');
        };
    }
    
    // Setup window dragging
    setupWindowDragging();
}

function showWindow(windowId) {
    console.log('Showing window:', windowId);
    const window = document.getElementById(windowId);
            if (window) {
            window.style.display = 'flex';
            bringToFront(window);
            
            // If it's the interests app, load the interests content
            if (windowId === 'interests-app') {
                loadInterestsContent();
            }
        }
    }

    // Load interests content dynamically
    function loadInterestsContent() {
        const interestsContent = document.getElementById('interests-content');
        if (!interestsContent) return;
        
        fetch('interests.json')
            .then(response => response.json())
            .then(data => {
                let html = `<h2 class="page-title">INTERESTS</h2>`;
                html += `<p>${data.introduction}</p>`;
                html += `<p><br>[ <a href="${data.carAdLink}" target="_blank">CLICK HERE</a> ] to watch an obnoxious old car ad that showcases a lot of my interests in a nutshell</p>`;
                
                data.sections.forEach(section => {
                    html += `<h2 class="subsection-title">${section.title}</h2>`;
                    html += `<p>${section.content}</p>`;
                    
                    if (section.subsections) {
                        html += '<ul>';
                        section.subsections.forEach(subsection => {
                            html += `<li>
                                <h3 class="subsection-title">${subsection.title}:</h3>
                                <div class="subsection-content">`;
                            
                            // Handle expandable content like the original
                            if (subsection.title === "Faster, Faster, until the thrill of speed overcomes the fear of death" || subsection.title === "My Love for American Cars") {
                                const shortContent = subsection.content.split(' ').slice(0, 50).join(' ') + '...';
                                html += `
                                    <p class="short-content">${shortContent}</p>
                                    <p class="full-content" style="display: none;">${subsection.content}</p>
                                    <button class="read-more-btn">READ MORE</button>
                                `;
                            } else {
                                html += `<p>${subsection.content}</p>`;
                            }
                            
                            if (subsection.list) {
                                html += '<ul class="car-list">';
                                subsection.list.forEach(item => {
                                    const [carName, description] = item.split('|').map(s => s.trim());
                                    html += `<li><span class="tooltip">${carName}<span class="tooltiptext">${description}</span></span></li>`;
                                });
                                html += '</ul>';
                            }
                            html += '</div></li>';
                        });
                        html += '</ul>';
                    }
                });
                
                interestsContent.innerHTML = html;
                setupReadMoreButtons();
                setupTooltips();
            })
            .catch(error => {
                console.error('Error loading interests:', error);
                interestsContent.innerHTML = '<p>Error loading interests content.</p>';
            });
    }

    function setupReadMoreButtons() {
        const readMoreButtons = document.querySelectorAll('.read-more-btn');
        readMoreButtons.forEach(button => {
            button.addEventListener('click', function() {
                const shortContent = this.previousElementSibling.previousElementSibling;
                const fullContent = this.previousElementSibling;
                
                if (fullContent.style.display === 'none') {
                    shortContent.style.display = 'none';
                    fullContent.style.display = 'block';
                    this.textContent = 'READ LESS';
                } else {
                    shortContent.style.display = 'block';
                    fullContent.style.display = 'none';
                    this.textContent = 'READ MORE';
                }
            });
        });
    }

    function setupTooltips() {
        // Tooltip functionality for car list
        const tooltips = document.querySelectorAll('.tooltip');
        tooltips.forEach(tooltip => {
            tooltip.addEventListener('mouseenter', function() {
                const tooltiptext = this.querySelector('.tooltiptext');
                if (tooltiptext) {
                    tooltiptext.style.visibility = 'visible';
                    tooltiptext.style.opacity = '1';
                }
            });
            
            tooltip.addEventListener('mouseleave', function() {
                const tooltiptext = this.querySelector('.tooltiptext');
                if (tooltiptext) {
                    tooltiptext.style.visibility = 'hidden';
                    tooltiptext.style.opacity = '0';
                }
            });
        });
    }



function hideWindow(windowId) {
    console.log('Hiding window:', windowId);
    const window = document.getElementById(windowId);
    if (window) {
        window.style.display = 'none';
    }
}

function bringToFront(window) {
    const allWindows = document.querySelectorAll('.app-window');
    allWindows.forEach(w => w.style.zIndex = '100');
    window.style.zIndex = '101';
}

function setupWindowDragging() {
    console.log('Setting up window dragging...');
    
    document.querySelectorAll('.window-header').forEach(header => {
        console.log('Setting up dragging for header:', header);
        
        let isDragging = false;
        let currentX = 0;
        let currentY = 0;
        let initialX = 0;
        let initialY = 0;
        let xOffset = 0;
        let yOffset = 0;
        
        const appWindow = header.closest('.app-window');
        
        // Mouse events
        header.addEventListener('mousedown', startDrag);
        
        // Touch events for mobile
        header.addEventListener('touchstart', startDrag);
        
        function startDrag(e) {
            // Don't drag if clicking close button
            if (e.target.classList.contains('close-btn')) {
                console.log('Close button clicked, not dragging');
                return;
            }
            
            console.log('Starting drag...');
            isDragging = true;
            
            // Get client coordinates from mouse or touch
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            initialX = clientX - xOffset;
            initialY = clientY - yOffset;
            
            bringToFront(appWindow);
            
            // Add cursor style
            document.body.style.cursor = 'move';
            
            // Prevent default to avoid scrolling on mobile
            e.preventDefault();
        }
        
        // Mouse move
        document.addEventListener('mousemove', handleMove);
        // Touch move
        document.addEventListener('touchmove', handleMove);
        
        function handleMove(e) {
            if (isDragging) {
                e.preventDefault();
                
                // Get client coordinates from mouse or touch
                const clientX = e.clientX || (e.touches && e.touches[0].clientX);
                const clientY = e.clientY || (e.touches && e.touches[0].clientY);
                
                currentX = clientX - initialX;
                currentY = clientY - initialY;
                
                xOffset = currentX;
                yOffset = currentY;
                
                // Constrain to viewport
                const maxX = window.innerWidth - appWindow.offsetWidth;
                const maxY = window.innerHeight - appWindow.offsetHeight;
                
                currentX = Math.max(0, Math.min(currentX, maxX));
                currentY = Math.max(0, Math.min(currentY, maxY));
                
                appWindow.style.left = currentX + 'px';
                appWindow.style.top = currentY + 'px';
            }
        }
        
        // Mouse up
        document.addEventListener('mouseup', endDrag);
        // Touch end
        document.addEventListener('touchend', endDrag);
        
        function endDrag() {
            if (isDragging) {
                console.log('Ending drag...');
                isDragging = false;
                document.body.style.cursor = 'default';
            }
        }
    });
}

// Try multiple times to ensure it works
setTimeout(setupDock, 100);
setTimeout(setupDock, 500);
setTimeout(setupDock, 1000);

document.addEventListener('DOMContentLoaded', setupDock);

if (document.readyState !== 'loading') {
    setupDock();
}



// Page navigation (keep existing for other links)
document.querySelectorAll('.learn-more-btn').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(targetId).classList.add('active');
    });
});

// Simulate typing effect
function typeEffect(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    const timer = setInterval(() => {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
        } else {
            clearInterval(timer);
        }
    }, speed);
}

// Apply typing effect to the contact info in the status bar
const contactInfo = document.getElementById('contact-info');
typeEffect(contactInfo, "Contact: hassaan@tavus.io");

// Close button functionality
document.getElementById('close-btn').addEventListener('click', function() {
    // You can customize this behavior
    alert('Thanks for visiting! This would close the window in a real application.');
});

// Navigation and highlighting
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        if (this.getAttribute('href') === '#') {
            e.preventDefault();
        }
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

// Highlight current page on load
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = document.body.id || 'home';
    document.querySelector(`.nav-link[data-page="${currentPage}"]`).classList.add('active');
});

// Add this function at the end of your script.js file
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('#nav-links a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage || 
            (currentPage === '' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', highlightCurrentPage);

document.addEventListener('DOMContentLoaded', function() {
    highlightCurrentPage();

    // ... (keep any existing code for other pages)
});

function setupCloseButton() {
    const closeBtn = document.getElementById('close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            alert('Thanks for visiting! This would close the window in a real application.');
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    highlightCurrentPage();
    setupCloseButton();

    // ... (keep any existing code for other pages)
});

// Remove or comment out the typeEffect function if it's not used elsewhere

// Replace the typing effect with a simple text assignment
document.addEventListener('DOMContentLoaded', function() {
    const contactInfo = document.getElementById('contact-info');
    if (contactInfo) {
        contactInfo.innerHTML = 'Contact: <a href="mailto:hassaan@tavus.io" style="color: #000;">hassaan@tavus.io</a>';
    }

    highlightCurrentPage();
    setupCloseButton();

    // ... (keep any existing code for other pages)
});
