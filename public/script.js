const http = require('http');

const options = {
    hostname: 'https://vercel.com',
    port: 80,
    path: '/?format=json',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        const ipInfo = JSON.parse(data);
        console.log('Public IP address:', ipInfo.ip);
    });
});

req.on('error', (error) => {
    console.error('Error getting public IP address:', error);
});

req.end();
