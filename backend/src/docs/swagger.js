const swaggerJsdoc = require('swagger-jsdoc');
const env = require('../config/env');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Speech Therapy Clinic API',
      version: '1.0.0',
      description: 'API documentation for rehabilitation and speech therapy center MVP.',
    },
    servers: [
      {
        url: `http://localhost:${env.port}`,
        description: 'Local development server',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Health', description: 'Health checks' },
    ],
    components: {
      schemas: {
        PatientLoginRequest: {
          type: 'object',
          required: ['accessCode'],
          properties: {
            accessCode: {
              type: 'string',
              example: 'AHMED123',
              minLength: 6,
              maxLength: 8,
            },
          },
        },
        PatientLoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            patient: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'clx123abc' },
                name: { type: 'string', example: 'Ahmed Mohamed' },
              },
            },
          },
        },
      },
    },
    paths: {
      '/api/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          responses: {
            200: {
              description: 'API status',
            },
          },
        },
      },
      '/api/patient/login': {
        post: {
          tags: ['Auth'],
          summary: 'Patient login using access code only',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PatientLoginRequest' },
              },
            },
          },
          responses: {
            200: {
              description: 'Patient logged in successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PatientLoginResponse' },
                },
              },
            },
            401: { description: 'Invalid access code' },
            422: { description: 'Validation error' },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
