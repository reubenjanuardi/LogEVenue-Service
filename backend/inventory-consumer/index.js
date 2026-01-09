const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/database');
const { graphqlHTTP } = require('express-graphql');
const inventorySchema = require('./graphql/inventorySchema');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4004;

app.use(cors());
app.use(express.json());

// REST Health Check
app.get('/', (req, res) => {
    res.json({ message: "B-Inventory Consumer Service is Running" });
});

// REST API Routes
app.use('/api', require('./routes/apiRoutes'));

// GraphQL Endpoint
app.use('/graphql', graphqlHTTP({
    schema: inventorySchema,
    graphiql: true,
}));

// Database Connection & Server Start
db.sync({ force: false })
    .then(() => {
        console.log('✅ Inventory Consumer Database Connected & Synced');
        app.listen(PORT, () => {
            console.log(`Inventory Consumer running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database Connection Error:', err);
    });
