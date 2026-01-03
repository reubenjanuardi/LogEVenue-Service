const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/database');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({ message: "B-Auth Service is Running (MySQL)" });
});


db.sync({ force: false })
    .then(() => {
        console.log('✅ Database MySQL Connected & Synced');
        app.listen(PORT, () => {
            console.log(`Auth Service running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database Connection Error:', err);
    });