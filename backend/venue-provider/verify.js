const http = require('http');

const post = (path, data) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 4002,
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

const get = (path) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 4002,
            path: path,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body || '{}') }));
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
};

const run = async () => {
    try {
        console.log('--- Testing Venue Service ---');

        // 1. Create Venue
        console.log('\n1. Creating Venue...');
        const venue = await post('/api/venues', {
            name: 'Grand Hall',
            address: '123 Main St',
            description: 'A large hall for events',
            imageUrl: 'http://example.com/hall.jpg'
        });
        console.log('Venue Created:', venue.body.id ? 'OK' : 'FAIL', venue.body);
        const venueId = venue.body.id;

        if (!venueId) throw new Error('Failed to create venue');

        // 2. Create Room
        console.log('\n2. Creating Room...');
        const room = await post('/api/venues/rooms', {
            venueId: venueId,
            name: 'Ballroom A',
            capacity: 100,
            facilities: ['Projector', 'Sound System'],
        });
        console.log('Room Created:', room.body.id ? 'OK' : 'FAIL', room.body);
        const roomId = room.body.id;

        if (!roomId) throw new Error('Failed to create room');

        // 3. Check Availability (Should be available)
        console.log('\n3. Checking Availability (Expect Available)...');
        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 24); // Tomorrow
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 2);

        const check1 = await post('/api/reservations/check-availability', {
            roomId,
            startTime,
            endTime
        });
        console.log('Availability:', check1.body.available === true ? 'OK' : 'FAIL', check1.body);

        // 4. Create Reservation
        console.log('\n4. Creating Reservation...');
        const reservation = await post('/api/reservations', {
            roomId,
            userId: 1, // Mock user ID
            startTime,
            endTime
        });
        console.log('Reservation Created:', reservation.body.id ? 'OK' : 'FAIL', reservation.body);

        // 5. Check Availability (Should be unavailable)
        console.log('\n5. Checking Availability (Expect Unavailable)...');
        const check2 = await post('/api/reservations/check-availability', {
            roomId,
            startTime,
            endTime
        });
        console.log('Availability:', check2.body.available === false ? 'OK' : 'FAIL', check2.body);

    } catch (err) {
        console.error('Test Failed:', err);
    }
};

run();
