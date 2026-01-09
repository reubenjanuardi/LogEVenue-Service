const db = require('./config/database');
require('./models/FeasibilityLog');

db.sync({ force: true })
    .then(() => {
        console.log('✅ Inventory Consumer Database Synced (Force: true)');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Error syncing database:', err);
        process.exit(1);
    });
