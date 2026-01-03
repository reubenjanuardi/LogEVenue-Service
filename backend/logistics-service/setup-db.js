const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function createDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS logistics_db;`);
        console.log('Database logistics_db created or already exists.');
        await connection.end();
    } catch (err) {
        console.error('Error creating database:', err);
    }
}

createDatabase();
