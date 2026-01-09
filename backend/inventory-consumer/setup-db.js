const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function createDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'inventory_consumer_db'};`);
        console.log(`Database ${process.env.DB_NAME || 'inventory_consumer_db'} created or already exists.`);
        await connection.end();
    } catch (err) {
        console.error('Error creating database:', err);
    }
}

createDatabase();
