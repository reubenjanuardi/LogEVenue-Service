const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function createDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS venue_db;`);
        console.log('Database venue_db created or already exists.');
        await connection.end();
    } catch (err) {
        console.error('Error creating database:', err);
    }
}

createDatabase();
