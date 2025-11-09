import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read writings.json
const writingsPath = path.join(__dirname, 'public', 'writings.json');
const writings = JSON.parse(fs.readFileSync(writingsPath, 'utf8'));

// Base URL
const baseUrl = 'https://hassaanraza.com';

// Static pages
const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/writing', priority: '0.8', changefreq: 'weekly' },
    { url: '/interests', priority: '0.6', changefreq: 'monthly' },
    { url: '/digitaltwin', priority: '0.6', changefreq: 'monthly' },
];

// Generate sitemap XML
function generateSitemap() {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    staticPages.forEach(page => {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += '  </url>\n';
    });

    // Add writing pages
    writings.forEach(writing => {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/writing/${writing.slug}</loc>\n`;
        xml += `    <lastmod>${writing.date}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += '  </url>\n';
    });

    xml += '</urlset>';

    return xml;
}

// Write sitemap to file
const sitemap = generateSitemap();
const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
fs.writeFileSync(sitemapPath, sitemap, 'utf8');

console.log(`✓ Sitemap generated with ${staticPages.length} static pages and ${writings.length} writing(s)`);
console.log(`  Location: /sitemap.xml`);
