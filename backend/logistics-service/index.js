const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4003;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: "B-Logistics Service is Running" });
});

app.use('/api', require('./routes/apiRoutes'));

const { graphqlHTTP } = require('express-graphql');
const logisticsSchema = require('./graphql/logisticsSchema');
const authMiddleware = require('./middleware/authMiddleware');

app.use('/graphql', authMiddleware, graphqlHTTP({
    schema: logisticsSchema,
    graphiql: true,
}));

// Database Connection
db.sync({ force: false })
    .then(() => {
        console.log('✅ Logistics Database Connected & Synced');
        app.listen(PORT, () => {
            console.log(`Logistics Service running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database Connection Error:', err);
    });
