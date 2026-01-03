const http = require('http');

const post = (path, data) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 4004,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(data))
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body || '{}') }));
        });

        req.on('error', (e) => reject(e));
        req.write(JSON.stringify(data));
        req.end();
    });
};

const run = async () => {
    try {
        console.log('--- Testing Inventory Consumer ---');

        // 1. Check Feasibility for Event 101 (Seminar Teknologi)
        // Needs Capacity 50, Facilities: Projector, Sound System
        console.log('\n1. Checking Feasibility for Event 101...');
        const check1 = await post('/api/check-event-feasibility', {
            eventId: '101'
        });
        console.log('Event 101 Feasibility:', check1.body.feasibility ? 'OK (Feasible)' : 'FAIL/Not Feasible', check1.body);

        // 2. Check Feasibility for Event 102 (Workshop Coding)
        console.log('\n2. Checking Feasibility for Event 102...');
        const check2 = await post('/api/check-event-feasibility', {
            eventId: '102'
        });
        console.log('Event 102 Feasibility:', check2.body.feasibility ? 'OK (Feasible)' : 'FAIL/Not Feasible', check2.body);

    } catch (err) {
        console.error('Test Failed:', err);
    }
};

run();
