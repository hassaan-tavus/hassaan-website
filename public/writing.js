// Writing section functionality
let writings = [];
let currentWriting = null;

// Load writings from JSON file
async function loadWritings() {
    try {
        const response = await fetch('/writings.json');
        if (!response.ok) {
            throw new Error('Failed to load writings');
        }
        writings = await response.json();
        console.log('Loaded writings metadata:', writings);
    } catch (error) {
        console.error('Error loading writings:', error);
        // Fallback to empty array if loading fails
        writings = [];
    }
}

// Load content from markdown file
async function loadMarkdownFile(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load ${filePath}`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
        return 'Content could not be loaded.';
    }
}

// Sample writing data - fallback if JSON loading fails
const sampleWritings = [
    {
        id: 1,
        slug: "the-last-terminal",
        title: "The Last Terminal",
        date: "2024-01-15",
        machine: "Compaq Portable III (1987)",
        authenticity: 85,
        content: `The screen flickers to life, amber text dancing across the monochrome display. I remember when this was cutting-edge technology - a portable computer that weighed as much as a small child but represented the future.

The Compaq Portable III sits before me, its gas plasma display casting an otherworldly glow in the dim room. The keyboard feels solid, mechanical, each keystroke a deliberate act of creation rather than the fluid dance of modern computing.

Writing on this machine is an exercise in patience and precision. There's no spell check, no auto-save, no distraction from the pure act of putting words to screen. Each character is earned, each sentence a small victory against the limitations of the hardware.

The authenticity score of 85% reflects the reality of vintage computing - some editing was done on modern systems, but the core writing, the soul of the piece, was born on this amber screen.`,
        journey: `The journey to write "The Last Terminal" began with a simple question: what would it be like to create something meaningful on the technology of the past?

I acquired the Compaq Portable III from a collector who had lovingly restored it. The machine booted up with its characteristic whir and click, the gas plasma display warming to life with that distinctive amber glow.

The writing process was... challenging. The 80-column display meant constant line breaks, the lack of modern conveniences forced a different kind of thinking. But there was something magical about the deliberate nature of it all.

I wrote the first draft entirely on the Compaq, then transferred it via floppy disk to a modern system for final editing. The 85% authenticity score reflects this hybrid approach - the heart of the piece was born on vintage hardware, but some refinement happened in the digital age.`
    },
    {
        id: 2,
        slug: "digital-ghosts",
        title: "Digital Ghosts",
        date: "2024-02-03",
        machine: "Apple IIe (1983)",
        authenticity: 92,
        content: `In the green phosphor glow of the Apple IIe, I find myself communing with digital ghosts. This machine, now over four decades old, still hums with the same energy that powered the personal computing revolution.

The Apple IIe represents a different era of computing - one where every program was a labor of love, where the machine itself was a canvas for creativity. Writing on this system feels like stepping back in time, but also forward into a more intentional future.

The 80-column text display forces a different kind of storytelling. Brevity becomes not just a virtue but a necessity. Each word must earn its place on the screen, each sentence must carry the weight of the limited real estate.

This piece was written almost entirely on the Apple IIe, with only minor formatting adjustments made on modern systems. The 92% authenticity score reflects the purity of the vintage computing experience.`,
        journey: `"Digital Ghosts" was born from a fascination with the Apple IIe's unique character. I spent weeks learning the machine's quirks - the way it handled text, the sound of its disk drive, the feel of its keyboard.

The writing process was meditative. The Apple IIe's limitations became features rather than bugs. The 40-column display in some modes forced me to think differently about sentence structure. The lack of modern editing tools meant every word had to be carefully considered before typing.

I wrote the entire piece on the Apple IIe, using its built-in text editor. The only modern intervention was transferring the final text to a contemporary system for web formatting. The 92% authenticity score reflects this nearly pure vintage computing experience.

The Apple IIe taught me that constraints can be liberating. Sometimes, having fewer options leads to better decisions.`
    },
    {
        id: 3,
        slug: "the-silicon-dream",
        title: "The Silicon Dream",
        date: "2024-02-20",
        machine: "IBM PC/AT (1984)",
        authenticity: 78,
        content: `The IBM PC/AT represents the corporate side of early computing - serious, business-focused, but still capable of poetry. Its monochrome display and mechanical keyboard create a different writing environment than the more colorful systems of the era.

Writing on the PC/AT feels like working in a corporate environment from another time. The machine is reliable, predictable, but lacks some of the personality of its contemporaries. Still, there's something satisfying about the solid construction and the way the keyboard responds to each keystroke.

The 78% authenticity score reflects the reality of vintage computing - some parts of the writing process required modern tools, but the core content was created on this classic machine. The PC/AT taught me that sometimes the most effective tools are the most straightforward ones.

This piece explores the tension between the corporate computing culture of the 1980s and the creative possibilities that emerged from those early systems.`,
        journey: `The IBM PC/AT was a different beast entirely. Where the Apple IIe felt playful and the Compaq Portable felt personal, the PC/AT felt like a serious business machine.

I acquired this particular unit from a former corporate office that was being renovated. The machine had been sitting in storage for decades, but with some cleaning and minor repairs, it booted up perfectly.

The writing process was more methodical than on other vintage systems. The PC/AT's business focus meant fewer creative flourishes, but more reliable performance. I wrote about 80% of the content on the vintage machine, then used modern systems for research and final editing.

The 78% authenticity score reflects this hybrid approach. The core writing happened on vintage hardware, but some research and refinement required modern tools. The PC/AT taught me that sometimes the most effective approach is the most practical one.`
    }
];

// Initialize the writing section
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize theme manager if it exists
    if (window.ThemeManager) {
        window.ThemeManager.init();
    }
    
    // Load writings from JSON file
    await loadWritings();
    
    // If no writings loaded, use sample data as fallback
    if (writings.length === 0) {
        console.log('No writings loaded from JSON, using sample data');
        writings = sampleWritings;
    }
    
    initializeWritingSection();
    
    // Check URL path for specific writing
    const path = window.location.pathname;
    const match = path.match(/\/writing\/(.+)$/);
    
    if (match && match[1]) {
        // Try to select the writing from URL
        const slug = match[1].replace('.html', '');
        const writing = writings.find(w => w.slug === slug);
        if (writing) {
            await selectWriting(writing.id, false); // false = don't update URL since we're already there
        }
    } else if (path.includes('/writing') && !match) {
        // We're on /writing.html or /writing with no specific writing selected
        // Just show the welcome screen (no need to do anything as it's the default)
        console.log('On writing page without specific writing selected');
    }
});

function initializeWritingSection() {
    // Set up navigation toggle
    const navToggle = document.getElementById('nav-toggle');
    const navPanel = document.getElementById('writing-nav');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const hamburgerClose = document.getElementById('hamburger-close');
    const mobileNavIcon = document.getElementById('mobile-nav-icon');
    const navPrev = document.getElementById('nav-prev');
    const navNext = document.getElementById('nav-next');
    const mobilePrev = document.getElementById('mobile-prev');
    const mobileNext = document.getElementById('mobile-next');
    
    // Desktop nav toggle
    navToggle.addEventListener('click', function() {
        navPanel.classList.toggle('collapsed');
    });
    
    // Navigation arrows
    if (navPrev) {
        navPrev.addEventListener('click', async function() {
            await navigateToPreviousWriting();
        });
    }
    
    if (navNext) {
        navNext.addEventListener('click', async function() {
            await navigateToNextWriting();
        });
    }
    
    // Mobile navigation arrows
    if (mobilePrev) {
        mobilePrev.addEventListener('click', async function() {
            await navigateToPreviousWriting();
        });
    }
    
    if (mobileNext) {
        mobileNext.addEventListener('click', async function() {
            await navigateToNextWriting();
        });
    }
    
    // Mobile nav icon
    if (mobileNavIcon) {
        mobileNavIcon.addEventListener('click', function() {
            hamburgerMenu.classList.toggle('active');
        });
    }
    
    // Close hamburger when clicking outside
    hamburgerMenu.addEventListener('click', function(e) {
        if (e.target === hamburgerMenu) {
            hamburgerMenu.classList.remove('active');
        }
    });
    
    // Mobile journey toggle
    const journeyToggle = document.getElementById('journey-toggle');
    const writingJourney = document.getElementById('writing-journey');
    
    if (journeyToggle && writingJourney) {
        journeyToggle.addEventListener('click', function() {
            const isOpen = writingJourney.classList.toggle('open');
            journeyToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Close journey when clicking outside (drawer backdrop behavior)
        document.addEventListener('click', function(e) {
            if (!writingJourney.contains(e.target) && e.target !== journeyToggle && writingJourney.classList.contains('open')) {
                writingJourney.classList.remove('open');
                journeyToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    // Populate writing lists (both desktop and mobile)
    populateWritingList();
    populateMobileWritingList();
    
    // Update stats
    updateStats();
    
    // Update navigation arrows
    updateNavigationArrows();
}

function populateWritingList() {
    const writingList = document.getElementById('writing-list');
    writingList.innerHTML = '';
    
    writings.forEach(writing => {
        const writingItem = document.createElement('div');
        writingItem.className = 'writing-item';
        writingItem.dataset.writingId = writing.id;
        
        writingItem.innerHTML = `
            <div class="writing-item-title">${writing.title}</div>
            <div class="writing-item-meta">
                <span>${writing.machine}</span>
                <span class="writing-item-score">${writing.authenticity}%</span>
            </div>
        `;
        
        writingItem.addEventListener('click', async function() {
            await selectWriting(writing.id);
        });
        
        writingList.appendChild(writingItem);
    });
}

function populateMobileWritingList() {
    const writingList = document.getElementById('writing-list-mobile');
    writingList.innerHTML = '';
    
    writings.forEach(writing => {
        const writingItem = document.createElement('div');
        writingItem.className = 'writing-item';
        writingItem.dataset.writingId = writing.id;
        
        writingItem.innerHTML = `
            <div class="writing-item-title">${writing.title}</div>
            <div class="writing-item-meta">
                <span>${writing.machine}</span>
                <span class="writing-item-score">${writing.authenticity}%</span>
            </div>
        `;
        
        writingItem.addEventListener('click', async function() {
            await selectWriting(writing.id);
            // Close hamburger menu on mobile after selection
            document.getElementById('hamburger-menu').classList.remove('active');
        });
        
        writingList.appendChild(writingItem);
    });
}

async function selectWriting(writingId, updateUrl = true) {
    const writing = writings.find(w => w.id === writingId);
    if (!writing) return;
    
    currentWriting = writing;
    
    // Update URL using History API for clean URLs
    if (updateUrl) {
        const newPath = `/writing/${writing.slug}`;
        window.history.pushState({ writingId: writing.id }, '', newPath);
    }
    
    // Update active state for all writing items (both desktop and mobile)
    document.querySelectorAll('.writing-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.writingId === writingId.toString()) {
            item.classList.add('active');
        }
    });
    
    // Show writing content
    await showWritingContent(writing);
    
    // Update navigation arrows
    updateNavigationArrows();
}

async function showWritingContent(writing) {
    const welcomeScreen = document.getElementById('welcome-screen');
    const writingDisplay = document.getElementById('writing-display');
    
    welcomeScreen.style.display = 'none';
    writingDisplay.style.display = 'flex';
    
    // Update writing content
    document.getElementById('writing-title-display').textContent = writing.title;
    document.getElementById('machine-used').textContent = writing.machine;
    document.getElementById('authenticity-score').textContent = writing.authenticity + '%';
    document.getElementById('writing-date').textContent = writing.date;
    
    // Load and parse markdown content from files
    const contentText = await loadMarkdownFile(writing.contentFile);
    const journeyText = await loadMarkdownFile(writing.journeyFile);
    
    document.getElementById('writing-text').innerHTML = marked.parse(contentText);
    document.getElementById('journey-text').innerHTML = marked.parse(journeyText);
    
    // Update journey title dynamically
    document.getElementById('journey-title').textContent = `THE JOURNEY: ${writing.title.toUpperCase()}`;
}

function updateStats() {
    const totalPieces = writings.length;
    const avgScore = Math.round(writings.reduce((sum, writing) => sum + writing.authenticity, 0) / totalPieces);
    
    // Update desktop stats
    document.getElementById('total-pieces').textContent = totalPieces;
    document.getElementById('avg-score').textContent = avgScore + '%';
    
    // Update mobile stats
    document.getElementById('total-pieces-mobile').textContent = totalPieces;
    document.getElementById('avg-score-mobile').textContent = avgScore + '%';
}

// Handle window resize
window.addEventListener('resize', function() {
    // Responsive adjustments if needed
});

// Handle browser back/forward buttons
window.addEventListener('popstate', async function(event) {
    if (event.state && event.state.writingId) {
        await selectWriting(event.state.writingId, false); // false = don't push to history again
    } else {
        // Try to parse the URL if no state
        const path = window.location.pathname;
        const match = path.match(/\/writing\/(.+)$/);
        if (match && match[1]) {
            const slug = match[1].replace('.html', '');
            const writing = writings.find(w => w.slug === slug);
            if (writing) {
                await selectWriting(writing.id, false);
            }
        } else {
            // No specific writing, show welcome screen
            document.getElementById('welcome-screen').style.display = 'flex';
            document.getElementById('writing-display').style.display = 'none';
            document.querySelectorAll('.writing-item').forEach(item => {
                item.classList.remove('active');
            });
        }
    }
});

// Handle hash changes for local development
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.slice(1);
    if (hash) {
        const writing = writings.find(w => w.slug === hash);
        if (writing) {
            selectWriting(writing.id, false);
        }
    } else {
        // No hash, show welcome screen
        document.getElementById('welcome-screen').style.display = 'flex';
        document.getElementById('writing-display').style.display = 'none';
        document.querySelectorAll('.writing-item').forEach(item => {
            item.classList.remove('active');
        });
    }
});

// Navigation functions
async function navigateToPreviousWriting() {
    if (!currentWriting || writings.length <= 1) return;
    
    const currentIndex = writings.findIndex(w => w.id === currentWriting.id);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : writings.length - 1;
    await selectWriting(writings[previousIndex].id);
}

async function navigateToNextWriting() {
    if (!currentWriting || writings.length <= 1) return;
    
    const currentIndex = writings.findIndex(w => w.id === currentWriting.id);
    const nextIndex = currentIndex < writings.length - 1 ? currentIndex + 1 : 0;
    await selectWriting(writings[nextIndex].id);
}

// Update navigation arrow states
function updateNavigationArrows() {
    const navPrev = document.getElementById('nav-prev');
    const navNext = document.getElementById('nav-next');
    const mobilePrev = document.getElementById('mobile-prev');
    const mobileNext = document.getElementById('mobile-next');
    
    // Update desktop arrows
    if (navPrev && navNext) {
        navPrev.disabled = !currentWriting;
        navNext.disabled = !currentWriting;
    }
    
    // Update mobile arrows
    if (mobilePrev && mobileNext) {
        mobilePrev.disabled = !currentWriting;
        mobileNext.disabled = !currentWriting;
    }
}
