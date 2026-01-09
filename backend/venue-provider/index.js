const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: "B-Venue Provider Service is Running" });
});

app.use('/api/venues', require('./routes/venueRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/public/webhook', require('./routes/webhookRoutes'));

const { graphqlHTTP } = require('express-graphql');
const venueSchema = require('./graphql/venueSchema');
const authMiddleware = require('./middleware/authMiddleware');

app.use('/graphql', authMiddleware, graphqlHTTP({
    schema: venueSchema,
    graphiql: true, // Enable GraphiQL UI
}));

// Database Connection
db.sync({ force: false })
    .then(() => {
        console.log('✅ Venue Database Connected & Synced');
        app.listen(PORT, () => {
            console.log(`Venue Service running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database Connection Error:', err);
    });
