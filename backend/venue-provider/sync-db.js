const db = require('./config/database');
const Venue = require('./models/Venue');
const Room = require('./models/Room');
const Reservation = require('./models/Reservation');

const sync = async () => {
    try {
        await db.sync({ force: true });
        console.log('Database synced with force: true');
        process.exit(0);
    } catch (err) {
        console.error('Error syncing database:', err);
        process.exit(1);
    }
};

sync();
