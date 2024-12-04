const express = require('express');
const app = express();
//const port = 8000;  // You can change the port if you need

// Middleware to parse JSON bodies
app.use(express.json());

require('dotenv').config();

const port = process.env.PORT || 3000;  // Use the port from .env or default to 3000


// Example route
// app.get('/show', (req, res) => {
//   res.send('Hello, Souvik Nag good!');
// });

const routes = require('./routes/routes');

app.use('/', routes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
