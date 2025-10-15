import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CodigoDelSur Backend API',
      version: '1.0.0',
      description: 'Node.js + Express + TypeScript + SQLite Backend API with JWT Authentication',
      contact: {
        name: 'Stefano Caiafa',
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Error message',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
            },
            data: {
              type: 'object',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            firstName: {
              type: 'string',
              example: 'John',
            },
            lastName: {
              type: 'string',
              example: 'Doe',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Movie: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 550,
            },
            title: {
              type: 'string',
              example: 'Fight Club',
            },
            overview: {
              type: 'string',
            },
            poster_path: {
              type: 'string',
            },
            release_date: {
              type: 'string',
            },
            vote_average: {
              type: 'number',
            },
            suggestionScore: {
              type: 'integer',
              example: 85,
            },
          },
        },
        Favorite: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            userId: {
              type: 'integer',
              example: 1,
            },
            movieId: {
              type: 'integer',
              example: 550,
            },
            title: {
              type: 'string',
              example: 'Fight Club',
            },
            addedAt: {
              type: 'string',
              format: 'date-time',
            },
            suggestionForTodayScore: {
              type: 'integer',
              example: 92,
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints',
      },
      {
        name: 'Movies',
        description: 'Movie search endpoints',
      },
      {
        name: 'Favorites',
        description: 'User favorites management',
      },
    ],
  },
  apis: ['./src/modules/**/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
