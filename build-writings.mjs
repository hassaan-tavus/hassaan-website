import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
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

// Read writings.json
const writingsPath = path.join(__dirname, 'public', 'writings.json');
const writings = JSON.parse(fs.readFileSync(writingsPath, 'utf8'));

// Ensure output directory exists
const outputDir = path.join(__dirname, 'public', 'writing');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Function to generate excerpt from markdown content
function generateExcerpt(content, maxLength = 160) {
    // Remove markdown syntax and get plain text
    const plainText = content
        .replace(/#{1,6}\s+/g, '') // Remove headers
        .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.+?)\*/g, '$1') // Remove italic
        .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim();

    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).trim() + '...';
}

// Function to extract first image from content
function extractFirstImage(content, isHtml = false) {
    if (isHtml) {
        // For HTML content, extract first img src
        const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
        return imgMatch ? imgMatch[1] : null;
    } else {
        // For markdown, look for both markdown images and HTML img tags
        const mdImageMatch = content.match(/!\[.*?\]\(([^)]+)\)/);
        if (mdImageMatch) return mdImageMatch[1];

        const htmlImageMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (htmlImageMatch) return htmlImageMatch[1];

        return null;
    }
}

// Function to make image URL absolute
function makeAbsoluteImageUrl(imagePath, baseUrl = 'https://hassaanraza.com') {
    if (!imagePath) return null;

    // Already absolute URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Make relative paths absolute
    if (imagePath.startsWith('/')) {
        return baseUrl + imagePath;
    }

    return baseUrl + '/' + imagePath;
}

// Function to generate HTML page for a writing
function generateWritingPage(writing) {
    const postType = writing.type || 'markdown'; // Default to markdown
    let contentHtml, journeyHtml, excerpt, contentForExcerpt;

    if (postType === 'html') {
        // For raw HTML posts
        const contentPath = path.join(__dirname, 'public', writing.contentFile);
        const journeyPath = path.join(__dirname, 'public', writing.journeyFile);

        // Read raw HTML content - it should already exist at this path
        const rawHtml = fs.readFileSync(contentPath, 'utf8');

        // Use iframe with src pointing to the raw HTML file
        // The contentFile path should be relative to /public
        contentHtml = `<iframe src="${writing.contentFile}" class="raw-html-viewer" sandbox="allow-same-origin allow-top-navigation-by-user-activation" scrolling="no"></iframe>`;

        // Journey can still be markdown
        const journeyMarkdown = fs.readFileSync(journeyPath, 'utf8');
        journeyHtml = marked.parse(journeyMarkdown);

        // Generate excerpt from raw HTML body content
        const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        const bodyContent = bodyMatch ? bodyMatch[1] : rawHtml;
        const plainText = bodyContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        excerpt = escapeHtml(plainText.substring(0, 160) + '...');
        contentForExcerpt = plainText;
    } else {
        // Original markdown processing
        const contentPath = path.join(__dirname, 'public', writing.contentFile);
        const journeyPath = path.join(__dirname, 'public', writing.journeyFile);

        const contentMarkdown = fs.readFileSync(contentPath, 'utf8');
        const journeyMarkdown = fs.readFileSync(journeyPath, 'utf8');

        // Convert markdown to HTML
        contentHtml = marked.parse(contentMarkdown);
        journeyHtml = marked.parse(journeyMarkdown);

        // Generate excerpt for meta description
        contentForExcerpt = contentMarkdown;
        excerpt = escapeHtml(generateExcerpt(contentMarkdown));
    }

    // Extract first image from content or journey for meta tags
    const contentPath = path.join(__dirname, 'public', writing.contentFile);
    const journeyPath = path.join(__dirname, 'public', writing.journeyFile);
    const contentRaw = fs.readFileSync(contentPath, 'utf8');
    const journeyRaw = fs.readFileSync(journeyPath, 'utf8');

    let firstImage = extractFirstImage(contentRaw, postType === 'html');
    if (!firstImage) {
        firstImage = extractFirstImage(journeyRaw, false); // Journey is always markdown
    }

    // If image is relative and from posts directory, make it absolute
    if (firstImage && !firstImage.startsWith('http')) {
        // Handle relative paths from the HTML file
        if (postType === 'html' && !firstImage.startsWith('/')) {
            // Image path is relative to the HTML file location
            const contentDir = path.dirname(writing.contentFile);
            firstImage = contentDir + '/' + firstImage;
        }
        firstImage = makeAbsoluteImageUrl(firstImage);
    }

    // Use custom ogImage from writings.json if provided, otherwise use detected image or fallback
    const ogImage = writing.ogImage || firstImage || 'https://opengraph.b-cdn.net/production/images/494fbd27-a97e-4ade-b18e-11f97794e266.png?token=YQeuoKGLxDJE9O3wsY76T-98Pf71vyKb79Td7hVyzc4&height=630&width=1200&expires=33262547243';

    // Use custom ogDescription from writings.json if provided, otherwise use auto-generated excerpt
    if (writing.ogDescription) {
        excerpt = escapeHtml(writing.ogDescription);
    }

    // Generate JSON-LD structured data
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": writing.title,
        "description": excerpt,
        "author": {
            "@type": "Person",
            "name": "Hassaan Raza",
            "url": "https://hassaanraza.com"
        },
        "datePublished": writing.date,
        "url": `https://hassaanraza.com/writing/${writing.slug}`,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://hassaanraza.com/writing/${writing.slug}`
        }
    };

    // Generate the HTML page
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(writing.title)} - Hassaan Raza</title>
    <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/style.css">

    <!-- Raw HTML Document Viewer Styles -->
    <style>
        .raw-html-viewer {
            width: 100%;
            min-height: 600px;
            border: 2px solid #333;
            background: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin: 20px 0;
            display: block;
        }
        .writing-text:has(.raw-html-viewer) {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
        }
    </style>

    <!-- Script to auto-resize iframe and fix link navigation -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const iframe = document.querySelector('.raw-html-viewer');
            if (iframe) {
                iframe.onload = function() {
                    try {
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        const height = iframeDoc.documentElement.scrollHeight;
                        iframe.style.height = height + 'px';

                        // Add base target to make all links open in parent window
                        const base = iframeDoc.createElement('base');
                        base.target = '_top';
                        iframeDoc.head.appendChild(base);

                        // Forward wheel events from iframe to parent scrollable container
                        const scrollContainer = document.querySelector('.content-panel');
                        iframeDoc.addEventListener('wheel', function(e) {
                            scrollContainer.scrollBy(0, e.deltaY);
                        }, { passive: true });
                    } catch(e) {
                        // If we can't access iframe content (CORS), set a default height
                        iframe.style.height = '800px';
                    }
                };
            }
        });
    </script>

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
    <link rel="canonical" href="https://hassaanraza.com/writing/${writing.slug}">

    <!-- Open Graph Meta Tags -->
    <meta property="og:url" content="https://hassaanraza.com/writing/${writing.slug}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapeHtml(writing.title)} - Hassaan Raza">
    <meta property="og:description" content="${excerpt}">
    <meta property="og:image" content="${ogImage}">
    <meta property="article:published_time" content="${writing.date}">
    <meta property="article:author" content="Hassaan Raza">

    <!-- Twitter Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta property="twitter:domain" content="hassaanraza.com">
    <meta property="twitter:url" content="https://hassaanraza.com/writing/${writing.slug}">
    <meta name="twitter:title" content="${escapeHtml(writing.title)} - Hassaan Raza">
    <meta name="twitter:description" content="${excerpt}">
    <meta name="twitter:image" content="${ogImage}">

    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
${JSON.stringify(structuredData, null, 4)}
    </script>
</head>
<body class="writing-body">
    <div id="app-bar">
        <button id="mobile-nav-icon" class="mobile-nav-icon">☰</button>
        <div class="mobile-nav-arrows">
            <button class="mobile-arrow" id="mobile-prev" aria-label="Previous writing">
                <img src="/icons/noun-arrow-170017.svg" alt="Previous" class="mobile-arrow-icon">
            </button>
            <button class="mobile-arrow" id="mobile-next" aria-label="Next writing">
                <img src="/icons/noun-arrow-170014.svg" alt="Next" class="mobile-arrow-icon">
            </button>
        </div>
        <h1 id="writing-title">Hassaan's Writing</h1>
        <div id="theme-button-container"></div>
        <button id="close-btn" onclick="window.location.href='/'">x</button>
    </div>

    <!-- Mobile Hamburger Menu -->
    <div id="hamburger-menu" class="hamburger-menu">
        <div class="mobile-nav-header">
            <h3>WRITINGS</h3>
            <div class="mobile-nav-stats">
                <div class="stat-item">
                    <span class="stat-label">TOTAL PIECES:</span>
                    <span class="stat-value" id="total-pieces-mobile">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">AVG SCORE:</span>
                    <span class="stat-value" id="avg-score-mobile">0 pts</span>
                </div>
            </div>
        </div>
        <div class="mobile-nav-content">
            <div class="writing-list" id="writing-list-mobile">
                <!-- Writing items will be populated by JavaScript -->
            </div>
        </div>
    </div>

    <div id="writing-container">
        <!-- Left Navigation Panel -->
        <div id="writing-nav" class="nav-panel">
            <div class="nav-header">
                <h3>WRITINGS</h3>
                <div class="nav-stats">
                    <div class="stat-item">
                        <span class="stat-label">TOTAL PIECES:</span>
                        <span class="stat-value" id="total-pieces">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">AVG SCORE:</span>
                        <span class="stat-value" id="avg-score">0 pts</span>
                    </div>
                </div>
            </div>
            <div class="nav-content">
                <div class="writing-list" id="writing-list">
                    <!-- Writing items will be populated by JavaScript -->
                </div>
            </div>
            <div class="nav-footer">
                <button class="nav-toggle" id="nav-toggle">
                    <span class="toggle-icon">
                        <img src="/icons/noun-book-7670082.svg" alt="Book" class="book-svg">
                    </span>
                    <span class="toggle-arrow">
                        <img src="/icons/noun-angle-170011.svg" alt="Toggle" class="toggle-arrow-icon">
                    </span>
                </button>
            </div>
            <!-- Collapsed navigation controls -->
            <div class="collapsed-nav-controls">
                <button class="nav-arrow" id="nav-prev" aria-label="Previous writing">
                    <img src="/icons/noun-arrow-170017.svg" alt="Previous" class="nav-arrow-icon">
                </button>
                <button class="nav-arrow" id="nav-next" aria-label="Next writing">
                    <img src="/icons/noun-arrow-170014.svg" alt="Next" class="nav-arrow-icon">
                </button>
            </div>
        </div>

        <!-- Right Content Panel -->
        <div id="writing-content" class="content-panel">
            <div id="welcome-screen" class="welcome-screen" style="display: none;">
                <div class="welcome-content">
                    <h2>VINTAGE WRITING EXPERIMENTS</h2>
                    <div class="welcome-text">
                        <p>Welcome to my vintage writing lab. Each piece here was written (or attempted) on a different vintage computer, with varying degrees of success.</p>
                        <p>Every writing includes:</p>
                        <ul>
                            <li><strong>SCORE:</strong> How much was actually written on the vintage machine</li>
                            <li><strong>MACHINE USED:</strong> The specific vintage computer used</li>
                            <li><strong>WRITING JOURNEY:</strong> The story of the writing process</li>
                        </ul>
                        <p>Select a writing from the left panel to begin reading.</p>
                    </div>
                </div>
            </div>

            <div id="writing-display" class="writing-display" style="display: flex;">
                <div class="writing-content-body">
                    <div class="writing-header">
                        <h2 id="writing-title-display">${escapeHtml(writing.title)}</h2>
                        <div class="writing-meta">
                            <div class="meta-item">
                                <span class="meta-label">MACHINE:</span>
                                <span class="meta-value" id="machine-used">${escapeHtml(writing.machine)}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">SCORE:</span>
                                <span class="meta-value" id="authenticity-score">${writing.authenticity} pts</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">DATE:</span>
                                <span class="meta-value" id="writing-date">${writing.date}</span>
                            </div>
                        </div>
                    </div>
                    <div class="writing-text" id="writing-text">${contentHtml}</div>
                </div>

                <div class="writing-journey" id="writing-journey">
                    <button class="journey-tab" id="journey-toggle" aria-expanded="false">THE MACHINE AND JOURNEY</button>
                    <div class="journey-content">
                        <h3 id="journey-title">THE JOURNEY: ${escapeHtml(writing.machine).toUpperCase()}</h3>
                        <div class="journey-text" id="journey-text">${journeyHtml}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script src="/script.js"></script>
    <script src="/writing.js"></script>
    <script>
        // Set the current writing ID for navigation
        window.PRELOADED_WRITING_ID = ${writing.id};
    </script>
</body>
</html>
`;

    return html;
}

// Generate pages for all writings
console.log(`Generating static pages for ${writings.length} writing(s)...`);

writings.forEach(writing => {
    const html = generateWritingPage(writing);
    const outputPath = path.join(outputDir, `${writing.slug}.html`);
    fs.writeFileSync(outputPath, html, 'utf8');
    console.log(`✓ Generated: /writing/${writing.slug}.html`);
});

console.log('\nStatic pages generated successfully!');
