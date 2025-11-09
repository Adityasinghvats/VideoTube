import swaggerJSDoc from 'swagger-jsdoc';
import { config } from 'dotenv';
config();

// Determine the correct protocol based on environment
const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
const port = process.env.PORT || 3000;
const host = process.env.API_BASE_URL || `${protocol}://localhost:${port}`;

const definition = {
    openapi: '3.0.0',
    info: {
        title: 'Video Backend API',
        version: '1.0.0',
        description: 'API documentation for Video backend',
    },
    servers: [
        {
            url: host,
            description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Local server',
        },
    ],
};

const options = {
    definition,
    apis: ['./src/routes/*.js', './src/controllers/*.js', './src/models/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
