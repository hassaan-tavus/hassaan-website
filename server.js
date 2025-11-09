const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Route for writing and its sub-paths
app.get('/writing/:slug', (req, res, next) => {
    const slug = req.params.slug;
    const filePath = path.join(__dirname, 'public', 'writing', `${slug}.html`);

    // Check if the static HTML file exists
    const fs = require('fs');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        // Fall back to writing.html for the main writing page
        res.sendFile(path.join(__dirname, 'public', 'writing.html'));
    }
});

// Route for main writing page
app.get('/writing', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'writing.html'));
});

// Route for other clean URLs
app.get('/:page', (req, res, next) => {
    const page = req.params.page;
    const validPages = ['interests', 'digitaltwin', 'investor-dojo', 'kiosk'];
    
    if (validPages.includes(page)) {
        res.sendFile(path.join(__dirname, 'public', `${page}.html`));
    } else {
        next();
    }
});

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
