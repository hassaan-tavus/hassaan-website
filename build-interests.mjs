import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to escape HTML for use in attributes
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Function to generate excerpt from text content
function generateExcerpt(content, maxLength = 160) {
    // Remove HTML tags
    const plainText = content
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).trim() + '...';
}

// Function to render interests content from JSON
function renderInterestsContent(data) {
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

                // For long content sections, include both short and full content for JavaScript interactivity
                if (subsection.title === "Faster, Faster, until the thrill of speed overcomes the fear of death" ||
                    subsection.title === "My Love for American Cars") {
                    const shortContent = subsection.content.split(' ').slice(0, 50).join(' ') + '...';
                    html += `
                        <p class="short-content">${shortContent}</p>
                        <p class="full-content" style="display: none;">${subsection.content}</p>
                        <button class="read-more-btn">READ MORE</button>
                    `;
                } else {
                    html += `<p>${subsection.content}</p>`;
                }

                // Render car list with tooltips
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

    return html;
}

// Read interests.json
const interestsPath = path.join(__dirname, 'public', 'interests.json');
const interestsData = JSON.parse(fs.readFileSync(interestsPath, 'utf8'));

// Generate excerpt for meta description
const excerpt = escapeHtml(generateExcerpt(interestsData.introduction));

// Render the interests content
const interestsContentHtml = renderInterestsContent(interestsData);

// Generate the static HTML page
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interests - Hassaan Raza</title>
    <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/style.css">

    <!-- Favicons -->
    <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png">
    <link rel="manifest" href="/favicon/site.webmanifest">
    <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#5bbad5">
    <meta name="msapplication-TileColor" content="#da532c">
    <meta name="theme-color" content="#ffffff">

    <!-- SEO Meta Tags -->
    <meta name="description" content="${excerpt}">
    <link rel="canonical" href="https://hassaanraza.com/interests">

    <!-- Open Graph Meta Tags -->
    <meta property="og:url" content="https://hassaanraza.com/interests">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Interests - Hassaan Raza">
    <meta property="og:description" content="${excerpt}">
    <meta property="og:image" content="https://opengraph.b-cdn.net/production/images/494fbd27-a97e-4ade-b18e-11f97794e266.png?token=YQeuoKGLxDJE9O3wsY76T-98Pf71vyKb79Td7hVyzc4&height=630&width=1200&expires=33262547243">

    <!-- Twitter Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta property="twitter:domain" content="hassaanraza.com">
    <meta property="twitter:url" content="https://hassaanraza.com/interests">
    <meta name="twitter:title" content="Interests - Hassaan Raza">
    <meta name="twitter:description" content="${excerpt}">
    <meta name="twitter:image" content="https://opengraph.b-cdn.net/production/images/494fbd27-a97e-4ade-b18e-11f97794e266.png?token=YQeuoKGLxDJE9O3wsY76T-98Pf71vyKb79Td7hVyzc4&height=630&width=1200&expires=33262547243">

    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "mainEntity": {
            "@type": "Person",
            "name": "Hassaan Raza",
            "description": "${excerpt}",
            "url": "https://hassaanraza.com",
            "sameAs": [
                "https://x.com/hassaanrza",
                "https://www.linkedin.com/in/hassaanraza/",
                "https://www.tavus.io"
            ]
        }
    }
    </script>
</head>
<body class="os-body">

    <!-- Side Dock Navigation -->
    <div id="side-dock">
        <div class="dock-item" data-app="about" title="About Hassaan" onclick="window.location.href='/'">
            <img src="icons/noun-home-6351217.svg" alt="About" class="dock-icon">
            <span class="dock-label">About</span>
        </div>
        <div class="dock-item active" data-app="interests" title="Interests">
            <img src="icons/noun-firework-6351198.svg" alt="Interests" class="dock-icon">
            <span class="dock-label">Interests</span>
        </div>
        <div class="dock-item" data-app="writing" title="Writing" onclick="window.location.href='/writing'">
            <img src="icons/noun-book-7670082.svg" alt="Writing" class="dock-icon">
            <span class="dock-label">Writing</span>
        </div>
        <div class="dock-item" data-app="digitaltwin" title="Digital Twin Chat" onclick="window.location.href='/digitaltwin'">
            <img src="icons/noun-people-6409675.svg" alt="Digital Twin" class="dock-icon">
            <span class="dock-label">AI Chat</span>
        </div>
    </div>

    <!-- Interests App Window -->
    <div id="interests-app" class="app-window" style="display: flex;">
        <div class="resize-handle"></div>
        <div class="window-header">
            <span class="window-title">Interests</span>
            <button class="close-btn" data-app="interests" onclick="window.location.href='/'">x</button>
        </div>
        <div class="window-content">
            <div class="app-content">
                <div class="digital-twin-container small">
                    <span>Instead of reading all of this you can join a video call with AI Hassaan</span>
                    <a href="/digitaltwin" class="digital-twin-link">Talk to My Digital Twin</a>
                </div>
                <div id="interests-content">
                    ${interestsContentHtml}
                </div>
            </div>
        </div>
    </div>

    <script src="/script.js"></script>
    <script src="/interests.js"></script>
</body>
</html>
`;

// Write the file
const outputPath = path.join(__dirname, 'public', 'interests.html');
fs.writeFileSync(outputPath, html, 'utf8');

console.log('✓ Generated static interests page: /interests.html');
