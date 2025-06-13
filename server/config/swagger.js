const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SkillExchange API',
      version: '1.0.0',
      description: 'A skill exchange platform API for connecting people to share and learn skills',
      contact: {
        name: 'SkillExchange Team',
        email: 'support@skillexchange.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js', './index.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };