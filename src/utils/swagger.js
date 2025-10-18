import swaggerJSDoc from 'swagger-jsdoc';
import { config } from 'dotenv';
config();

const definition = {
    openapi: '3.0.0',
    info: {
        title: 'Video Backend API',
        version: '1.0.0',
        description: 'API documentation for Video backend',
    },
    servers: [
        {
            url: 'http://localhost:' + (process.env.PORT || 3000),
            description: 'Local server',
        },
    ],
};

const options = {
    definition,
    apis: ['./src/routes/*.js', './src/controllers/*.js', './src/models/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
