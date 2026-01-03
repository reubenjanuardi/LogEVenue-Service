const http = require('http');

const post = (path, data) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 4003,
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
            port: 4003,
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
        console.log('--- Testing Logistics Service ---');

        // 1. Create Item
        console.log('\n1. Creating Item...');
        const item = await post('/api/items', {
            name: 'Projector XYZ',
            description: 'High quality projector',
            category: 'Electronics',
            totalStock: 10,
            availableStock: 10
        });
        console.log('Item Created:', item.body.id ? 'OK' : 'FAIL', item.body);
        const itemId = item.body.id;

        if (!itemId) throw new Error('Failed to create item');

        // 2. Borrow Item
        console.log('\n2. Borrowing Item...');
        const borrow = await post('/api/borrow', {
            itemId: itemId,
            quantity: 2,
            eventId: 101,
            borrowerName: 'Committee Alpha'
        });
        console.log('Borrow Transaction:', borrow.body.id ? 'OK' : 'FAIL', borrow.body);
        const transactionId = borrow.body.id;

        // 3. Check Stock (Should be 8)
        console.log('\n3. Checking Stock (Expect 8)...');
        const checkItem = await get(`/api/items/${itemId}`);
        console.log('Stock:', checkItem.body.availableStock === 8 ? 'OK' : 'FAIL', checkItem.body.availableStock);

        // 4. Return Item
        console.log('\n4. Returning Item...');
        const returnItem = await post('/api/return', {
            transactionId: transactionId
        });
        console.log('Return Status:', returnItem.status === 200 ? 'OK' : 'FAIL', returnItem.body);

        // 5. Check Stock (Should be 10 again)
        console.log('\n5. Checking Stock (Expect 10)...');
        const checkItem2 = await get(`/api/items/${itemId}`);
        console.log('Stock:', checkItem2.body.availableStock === 10 ? 'OK' : 'FAIL', checkItem2.body.availableStock);

    } catch (err) {
        console.error('Test Failed:', err);
    }
};

run();
