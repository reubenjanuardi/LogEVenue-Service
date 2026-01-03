const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4004;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: "B-Inventory Consumer Service is Running" });
});

app.use('/api', require('./routes/apiRoutes'));

app.listen(PORT, () => {
    console.log(`Inventory Consumer running on port ${PORT}`);
});
