const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const caseRoutes = require('./routes/caseRoutes');
const myRoutes = require('./routes/myRoutes');
const path = require('path');
require('dotenv').config();


const port = process.env.PORT || 3000;  // Use the port from .env or default to 3000

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/cases', caseRoutes);

const routes = require('./routes/routes');

app.use('/', routes);

app.use('/', myRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

