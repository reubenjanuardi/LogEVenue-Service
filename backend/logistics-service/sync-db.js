const db = require('./config/database');
const Item = require('./models/Item');
const Transaction = require('./models/Transaction');

db.sync({ force: true }) // Use force: true to ensure clean state for verification
    .then(() => {
        console.log('✅ Logistics Database Synced (Force: true)');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Error syncing database:', err);
        process.exit(1);
    });
