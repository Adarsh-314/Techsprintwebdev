const fs = require('fs');
const path = require('path');

// Files to copy to public directory
const filesToCopy = [
  'lakshu.html',
  'styles.css',
  'script.js',
  'menu.js',
  'animations.js',
  'test.png'
];

// Create public directory if it doesn't exist
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// Copy files
filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, '..', file);
  const destPath = path.join(__dirname, '..', 'public', file);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file} to public/`);
  } else {
    console.log(`Warning: ${file} not found, skipping`);
  }
});

// Rename lakshu.html to index.html for hosting
const indexPath = path.join(__dirname, '..', 'public', 'index.html');
const lakshuPath = path.join(__dirname, '..', 'public', 'lakshu.html');

if (fs.existsSync(lakshuPath)) {
  fs.copyFileSync(lakshuPath, indexPath);
  console.log('Created index.html from lakshu.html');
}

// Create additional PWA files
const manifest = {
  "name": "Pocket Infrastructure",
  "short_name": "PocketInfra",
  "description": "Citizen-driven platform to report infrastructure issues",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1e40af",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
};

fs.writeFileSync(path.join(__dirname, '..', 'public', 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('Created manifest.json');

// Create robots.txt
const robots = `User-agent: *
Allow: /

Sitemap: https://your-domain.com/sitemap.xml
`;

fs.writeFileSync(path.join(__dirname, '..', 'public', 'robots.txt'), robots);
console.log('Created robots.txt');

// Create sitemap.xml
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://your-domain.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

fs.writeFileSync(path.join(__dirname, '..', 'public', 'sitemap.xml'), sitemap);
console.log('Created sitemap.xml');

console.log('Build completed successfully!');