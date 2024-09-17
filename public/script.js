let scene, camera, renderer, grid;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('cityscape'), alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create a static grid
    const size = 1000;
    const divisions = 50;
    grid = new THREE.GridHelper(size, divisions, 0x00ff00, 0x00ff00);
    grid.position.set(0, -250, -500);
    grid.rotation.x = Math.PI / 2;
    scene.add(grid);

    camera.position.set(0, 0, 10);
    camera.lookAt(grid.position);

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

init();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Page navigation
document.querySelectorAll('#title-bar a, .learn-more-btn').forEach(anchor => {
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
