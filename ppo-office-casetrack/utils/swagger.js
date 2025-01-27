import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DL Suspension API',
      version: '1.0.0',
      description: 'Driving License Suspension Recommendation Proccess',
    },
    servers: [
      {
        url: API_URL,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };