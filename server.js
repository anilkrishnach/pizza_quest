const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

// Function to get local IP addresses
function getLocalIPs() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    
    for (const interfaceName in interfaces) {
        const interfaceInfo = interfaces[interfaceName];
        for (const info of interfaceInfo) {
            // Skip over non-IPv4 and internal (loopback) addresses
            if (info.family === 'IPv4' && !info.internal) {
                addresses.push(info.address);
            }
        }
    }
    
    return addresses;
}

const server = http.createServer((req, res) => {
    console.log(`Request for ${req.url}`);
    
    // Normalize URL to prevent directory traversal attacks
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }
    
    const extname = path.extname(filePath);
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Page not found
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Listen on all network interfaces (0.0.0.0) instead of just localhost
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    
    // Display all available IP addresses for network access
    const ipAddresses = getLocalIPs();
    if (ipAddresses.length > 0) {
        console.log('\nAccess from other devices on the same network:');
        ipAddresses.forEach(ip => {
            console.log(`http://${ip}:${PORT}/`);
        });
    }
}); 