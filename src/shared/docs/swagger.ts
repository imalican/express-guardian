import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import { version } from '../../../package.json';

const specs = {
  openapi: '3.0.0',
  info: {
    title: 'Express Guardian API',
    version,
    description: `
      A secure and scalable Express.js boilerplate API with comprehensive monitoring.
      
      ## Rate Limiting
      - Global: 100 requests per 15 minutes
      - Auth endpoints: 5 requests per 15 minutes
      - API endpoints: 30 requests per minute
      
      ## Authentication
      Use Bearer token authentication. Token can be obtained from /auth/login endpoint.
      
      ## Versioning
      Current version: v1
      Base path: /api/v1
    `,
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
    contact: {
      name: 'API Support',
      email: 'support@example.com',
      url: 'https://github.com/imalican/express-guardian',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1',
    },
    {
      url: '/api/v2',
      description: 'API v2 (Coming soon)',
    },
  ],
  tags: [
    {
      name: 'Auth',
      description: 'Authentication and authorization operations',
    },
    {
      name: 'Users',
      description: 'User management operations',
    },
    {
      name: 'Files',
      description: 'File upload and management',
    },
    {
      name: 'Monitoring',
      description: 'System monitoring and health checks',
    },
  ],
  externalDocs: {
    description: 'Find out more about Express Guardian',
    url: 'https://github.com/imalican/express-guardian',
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          message: { type: 'string' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          role: { type: 'string', enum: ['user', 'admin'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      File: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          originalName: { type: 'string' },
          mimeType: { type: 'string' },
          size: { type: 'number' },
          path: { type: 'string' },
          uploadedBy: { $ref: '#/components/schemas/User' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Metrics: {
        type: 'object',
        properties: {
          hits: { type: 'number' },
          totalDuration: { type: 'number' },
          avgDuration: { type: 'number' },
          errors: { type: 'number' },
          lastAccessed: { type: 'string', format: 'date-time' },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      ForbiddenError: {
        description: 'Insufficient permissions',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      ValidationError: {
        description: 'Invalid request data',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  role: { type: 'string', enum: ['user', 'admin'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully' },
        },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        summary: 'Get all users',
        parameters: [
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', default: 1 },
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 10 },
          },
        ],
        responses: {
          200: { description: 'List of users' },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        summary: 'Get user by ID',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'User details' },
          404: { description: 'User not found' },
        },
      },
      patch: {
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        summary: 'Update user',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'User updated successfully' },
          404: { description: 'User not found' },
        },
      },
      delete: {
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        summary: 'Delete user',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          204: { description: 'User deleted successfully' },
          404: { description: 'User not found' },
        },
      },
    },
    '/monitoring/health': {
      get: {
        tags: ['Monitoring'],
        summary: 'Get system health status',
        responses: {
          200: { description: 'System health information' },
        },
      },
    },
    '/monitoring/metrics': {
      get: {
        tags: ['Monitoring'],
        security: [{ bearerAuth: [] }],
        summary: 'Get system metrics',
        responses: {
          200: { description: 'System metrics information' },
        },
      },
    },
    '/monitoring/logs': {
      get: {
        tags: ['Monitoring'],
        security: [{ bearerAuth: [] }],
        summary: 'Get application logs',
        responses: {
          200: { description: 'Application logs' },
        },
      },
    },
    '/files/upload': {
      post: {
        tags: ['Files'],
        security: [{ bearerAuth: [] }],
        summary: 'Upload file',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'File uploaded successfully' },
        },
      },
    },
  },
} as const;

export function setupSwagger(app: Application): void {
  const swaggerRoute = '/api-docs';
  app.use(swaggerRoute, swaggerUi.serve);
  app.use(swaggerRoute, swaggerUi.setup(specs));
}
