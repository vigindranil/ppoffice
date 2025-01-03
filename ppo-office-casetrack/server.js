const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const port = process.env.PORT || 3000;  // Use the port from .env or default to 3000

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Set up Swagger options
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',  // Specify the OpenAPI version (Swagger 3.0)
    info: {
      title: 'My API',  // API title
      version: '1.0.0', // API version
      description: 'This is the API documentation for my app', // API description
    },
    servers: [
      {
        url: `http://localhost:${port}`, // Server URL
      },
    ],
  },
  // Specify the path to your API routes files
  apis: ['./routes/routes.js'],  // Adjust the path as necessary
};

// Initialize Swagger JSDoc
const swaggerDocs = swaggerJSDoc(swaggerOptions);

// Serve Swagger API Docs on /api-docs route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const routes = require('./routes/routes');

app.use('/', routes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
