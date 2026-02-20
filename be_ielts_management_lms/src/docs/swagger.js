// Swagger/OpenAPI documentation configuration for User API
const swaggerJsdoc = require("swagger-jsdoc");

// Dynamic server URL based on environment
const getServerUrl = () => {
  if (process.env.NODE_ENV === "production") {
    let url = process.env.API_URL || "http://localhost:5000";
    // Add https:// if no protocol specified
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return url;
  }
  return `http://localhost:${process.env.PORT || 5000}`;
};

// Contact info from environment
const getContactEmail = () => process.env.API_SUPPORT_EMAIL || "support@example.com";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: process.env.API_TITLE || "Wedding Invitation Management API",
      version: process.env.API_VERSION || "1.0.0",
      description: process.env.API_DESCRIPTION || "User Authentication API for Wedding Invitation Management System",
      contact: {
        name: "API Support",
        email: getContactEmail(),
      },
    },
    servers: [
      {
        url: getServerUrl(),
        description: process.env.NODE_ENV === "production" ? "Production server" : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error message",
            },
            errors: {
              type: "array",
              nullable: true,
              items: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  field: { type: "string" }
                }
              }
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Operation successful",
            },
            data: {
              type: "object",
              nullable: true,
            },
          },
        },
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64f8a2c9e123456789abcdef" },
            email: { type: "string", format: "email", example: "user@example.com" },
            firstName: { type: "string", example: "John" },
            lastName: { type: "string", example: "Doe" },
            phone: { type: "string", example: "+1234567890" },
            avatar: { type: "string", nullable: true },
            role: { type: "string", enum: ["student", "teacher", "admin"] },
            isActive: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["email", "password", "firstName", "lastName", "role"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            firstName: { type: "string" },
            lastName: { type: "string" },
            phone: { type: "string" },
            role: { type: "string", enum: ["student", "teacher", "admin"] },
          },
        },
        TokenResponse: {
          type: "object",
          properties: {
            token: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
          },
        },
        UpdateProfileRequest: {
          type: "object",
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            phone: { type: "string" },
            avatar: { type: "string" },
          },
        },
        ChangePasswordRequest: {
          type: "object",
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: { type: "string" },
            newPassword: { type: "string", minLength: 8 },
          },
        },
        Guest: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64f8a2c9e123456789abcdef" },
            guestName: { type: "string", example: "John Doe" },
            categoryId: { type: "string", nullable: true, example: "64f8a2c9e123456789abcdef" },
            categoryName: { type: "string", nullable: true, example: "Family" },
            numberOfGuests: { type: "number", example: 2 },
            confirmedGuests: { type: "number", example: 2 },
            invitationSent: { type: "boolean", example: true },
            tableId: { type: "string", nullable: true, example: "64f8a2c9e123456789abcdef" },
            tableName: { type: "string", nullable: true, example: "Table 1" },
            noteId: { type: "string", nullable: true, example: "64f8a2c9e123456789abcdef" },
            noteName: { type: "string", nullable: true, example: "Definitely (Confirmed) - 100%" },
            isArrived: { type: "boolean", example: false },
            arrivedAt: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Table: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64f8a2c9e123456789abcdef" },
            tableNumber: { type: "string", example: "Table 1" },
            capacity: { type: "number", example: 10 },
            status: { type: "string", enum: ["available", "occupied"], example: "available" },
            currentGuests: { type: "number", example: 0 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Category: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64f8a2c9e123456789abcdef" },
            name: { type: "string", example: "Family" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "User authentication and profile management endpoints"
      },
      {
        name: "Health",
        description: "Health check endpoints"
      },
      {
        name: "Root",
        description: "API root endpoint"
      },
      {
        name: "Dashboard",
        description: "API dashboard endpoints (requires authentication)"
      },
      {
        name: "Guests",
        description: "Guest management endpoints (requires authentication)"
      },
      {
        name: "Tables",
        description: "Table management endpoints (requires authentication)"
      },
      {
        name: "Categories",
        description: "Category management endpoints (requires authentication)"
      }
    ],
  },
  apis: [
    "./src/app.js",
    "./src/routes/**/*.js",
    "./src/controllers/**/*.js",
  ],
};

// Function to regenerate swagger spec (for hot reload)
const generateSwaggerSpec = () => {
  return swaggerJsdoc(options);
};

module.exports = generateSwaggerSpec();
