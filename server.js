const express = require('express');
const path = require('path');
const os = require('os');

const app = express();
// Use environment port or default to 3000
const PORT = process.env.PORT || 3000;

// Function to get local IP addresses (only used in development)
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

// Serve static files from the current directory
app.use(express.static(__dirname));

// Log all requests
app.use((req, res, next) => {
    console.log(`Request for ${req.url}`);
    next();
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).send('<h1>404 Not Found</h1>');
});

// Start the server
const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    
    // Only show local IPs in development environment
    if (process.env.NODE_ENV !== 'production') {
        const ipAddresses = getLocalIPs();
        if (ipAddresses.length > 0) {
            console.log('\nAccess from other devices on the same network:');
            ipAddresses.forEach(ip => {
                console.log(`http://${ip}:${PORT}/`);
            });
        }
    }
});

// Export the Express API for Vercel
module.exports = app; 