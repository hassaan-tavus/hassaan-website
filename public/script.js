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
            
            // Only start drag if clicking on the header itself, not on child elements
            if (e.target !== header && !header.contains(e.target)) {
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
                // Only prevent default when actually dragging
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

// All initialization moved to main DOMContentLoaded listener



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
    if (!element) {
        console.warn('typeEffect: element is null');
        return;
    }
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

// Apply typing effect to the contact info in the status bar (moved to DOMContentLoaded)
// This will be handled in the DOMContentLoaded event listener below

// Close button functionality (moved to DOMContentLoaded)
// This will be handled in the setupCloseButton function

// Navigation and highlighting (moved to DOMContentLoaded)
// This will be handled in the main DOMContentLoaded event listener

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

function setupCloseButton() {
    const closeBtn = document.getElementById('close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            alert('Thanks for visiting! This would close the window in a real application.');
        });
    }
}

// All DOMContentLoaded listeners consolidated into main one below

// Remove or comment out the typeEffect function if it's not used elsewhere

// Theme Switching Functionality
const ThemeManager = {
    themes: {
        'orange': { name: 'Orange', class: 'theme-orange' },
        'classic-orange': { name: 'Classic Orange', class: 'theme-classic-orange' },
        'green': { name: 'Matrix Green', class: 'theme-green' },
        'matrix': { name: 'Matrix Neo', class: 'theme-matrix' },
        'blue': { name: 'Blue Terminal', class: 'theme-blue' },
        'purple': { name: 'Purple Haze', class: 'theme-purple' },
        'red': { name: 'Red Alert', class: 'theme-red' },
        'amber': { name: 'Amber Glow', class: 'theme-amber' },
        'cyan': { name: 'Cyan Space', class: 'theme-cyan' },
        'silo': { name: 'Silo Green', class: 'theme-silo' },
        'monochrome': { name: 'Monochrome', class: 'theme-monochrome' }
    },
    
    currentTheme: 'orange',
    
    init() {
        console.log('ThemeManager.init() called');
        // Load saved theme
        const savedTheme = localStorage.getItem('hassaan-theme');
        if (savedTheme && this.themes[savedTheme]) {
            this.currentTheme = savedTheme;
        }
        console.log('Current theme:', this.currentTheme);
        this.applyTheme(this.currentTheme);
        this.createThemeSelector();
    },
    
    applyTheme(themeKey) {
        console.log('applyTheme called with:', themeKey);
        if (!this.themes[themeKey]) {
            console.error('Theme not found:', themeKey);
            return;
        }
        
        const root = document.documentElement;
        const body = document.body;
        console.log('Current root classes before:', root.classList.toString());
        console.log('Current body classes before:', body.classList.toString());
        
        // Remove all theme classes from both root and body
        Object.values(this.themes).forEach(theme => {
            root.classList.remove(theme.class);
            body.classList.remove(theme.class);
            console.log('Removed class:', theme.class);
        });
        
        // Add new theme class to root element
        root.classList.add(this.themes[themeKey].class);
        console.log('Added class to root:', this.themes[themeKey].class);
        console.log('Current root classes after:', root.classList.toString());
        
        this.currentTheme = themeKey;
        localStorage.setItem('hassaan-theme', themeKey);
        
        // Check if CSS variables are updating
        const rootStyle = getComputedStyle(document.documentElement);
        const bodyStyle = getComputedStyle(document.body);
        const rootPrimaryColor = rootStyle.getPropertyValue('--primary-color').trim();
        const bodyPrimaryColor = bodyStyle.getPropertyValue('--primary-color').trim();
        console.log('Root primary color:', rootPrimaryColor);
        console.log('Body primary color:', bodyPrimaryColor);
        const primaryColor = bodyPrimaryColor || rootPrimaryColor;
        
        // Update grid color for digital twin if it exists
        if (window.updateGridColor && typeof window.updateGridColor === 'function') {
            window.updateGridColor(primaryColor);
        }
        
        console.log(`Applied theme: ${this.themes[themeKey].name}`);
    },
    
    createThemeSelector() {
        console.log('createThemeSelector() called');
        // Check if theme selector already exists
        if (document.getElementById('theme-selector')) {
            console.log('Theme selector already exists');
            return;
        }
        
        // Create theme selector
        const selector = document.createElement('div');
        selector.id = 'theme-selector';
        selector.className = 'theme-selector';
        selector.innerHTML = `
            <button id="theme-toggle" class="theme-toggle">
                🎨 THEMES
            </button>
            <div id="theme-menu" class="theme-menu">
                ${Object.entries(this.themes).map(([key, theme]) => 
                    `<button class="theme-option" data-theme="${key}">${theme.name}</button>`
                ).join('')}
            </div>
        `;
        
        // Add styles for theme selector
        if (!document.getElementById('theme-selector-styles')) {
            const styles = document.createElement('style');
            styles.id = 'theme-selector-styles';
            styles.textContent = `
                .theme-selector {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    font-family: 'Web437', 'VT323', monospace;
                }
                
                .theme-toggle {
                    background: var(--button-bg);
                    color: var(--button-text);
                    border: 1px solid var(--border-color);
                    padding: 8px 12px;
                    cursor: pointer;
                    font-family: inherit;
                    font-size: 12px;
                    box-shadow: 0 0 5px var(--shadow-color);
                }
                
                .theme-toggle:hover {
                    background: var(--button-bg-hover);
                }
                
                .theme-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: var(--background-primary);
                    border: 1px solid var(--border-color);
                    min-width: 150px;
                    max-height: 300px;
                    overflow-y: auto;
                    display: none;
                    box-shadow: 0 0 10px var(--shadow-color);
                }
                
                .theme-menu.open {
                    display: block;
                }
                
                .theme-option {
                    display: block;
                    width: 100%;
                    background: transparent;
                    color: var(--text-primary);
                    border: none;
                    padding: 8px 12px;
                    text-align: left;
                    cursor: pointer;
                    font-family: inherit;
                    font-size: 11px;
                    border-bottom: 1px solid var(--border-color);
                }
                
                .theme-option:hover {
                    background: var(--bg-overlay);
                }
                
                .theme-option:last-child {
                    border-bottom: none;
                }
                
                .theme-option.active {
                    background: var(--bg-overlay-strong);
                    color: var(--text-secondary);
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(selector);
        console.log('Theme selector appended to body');
        
        // Add event listeners
        const toggle = document.getElementById('theme-toggle');
        const menu = document.getElementById('theme-menu');
        
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('open');
            this.updateActiveTheme();
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', () => {
            menu.classList.remove('open');
        });
        
        // Theme option clicks
        menu.addEventListener('click', (e) => {
            console.log('Menu clicked, target:', e.target);
            if (e.target.classList.contains('theme-option')) {
                const themeKey = e.target.getAttribute('data-theme');
                console.log('Theme option clicked:', themeKey);
                this.applyTheme(themeKey);
                menu.classList.remove('open');
                this.updateActiveTheme();
            }
        });
    },
    
    updateActiveTheme() {
        const options = document.querySelectorAll('.theme-option');
        options.forEach(option => {
            option.classList.toggle('active', 
                option.getAttribute('data-theme') === this.currentTheme);
        });
    }
};

// Make ThemeManager globally available
window.ThemeManager = ThemeManager;

// Main DOMContentLoaded event listener - consolidating all initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Main DOMContentLoaded event fired');
    
    // Initialize dock functionality
    setupDock();
    
    // Initialize window dragging
    setupWindowDragging();
    
    // Initialize status bar
    setupStatusBar();
    
    // Handle contact info with typing effect
    const contactInfo = document.getElementById('contact-info');
    if (contactInfo) {
        // Use typing effect if available, otherwise use direct assignment
        if (typeof typeEffect === 'function') {
            typeEffect(contactInfo, "Contact: hassaan@tavus.io");
        } else {
            contactInfo.innerHTML = 'Contact: <a href="mailto:hassaan@tavus.io" style="color: #000;">hassaan@tavus.io</a>';
        }
    }

    // Initialize navigation highlighting
    highlightCurrentPage();
    
    // Initialize close button
    setupCloseButton();
    
    // Initialize theme manager
    console.log('Initializing ThemeManager from main DOMContentLoaded');
    ThemeManager.init();
});

// Also try to initialize on window load as a backup
window.addEventListener('load', function() {
    console.log('Window load event - checking ThemeManager');
    if (!document.getElementById('theme-selector')) {
        console.log('Theme selector not found, creating it now');
        ThemeManager.init();
    }
});

