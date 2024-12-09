const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

const port = process.env.PORT || 3000;  // Use the port from .env or default to 3000

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

const routes = require('./routes/routes');

app.use('/', routes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

