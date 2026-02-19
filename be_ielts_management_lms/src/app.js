// Express app configuration: routes, middleware, swagger, error handling
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");
const { isAppError } = require("./utils/appError");
const { sendError } = require("./utils/response");
const MESSAGES = require("./constants/messages");

const app = express();

// Toggle Swagger UI - controlled by SWAGGER_UI_ENABLED env variable
// Set SWAGGER_UI_ENABLED=true to enable Swagger UI
const isSwaggerEnabled =
  String(process.env.SWAGGER_UI_ENABLED || "false").toLowerCase() === "true";

// CORS Configuration - Allow all origins with credentials
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Body parser and cookie parser middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Service is healthy
 */
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    service: "IELTS Management LMS API"
  });
});

/**
 * @swagger
 * /:
 *   get:
 *     tags: [Root]
 *     summary: API Root - Welcome message
 *     responses:
 *       200:
 *         description: Welcome to IELTS Management LMS API
 */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to IELTS Management LMS API",
    version: "1.0.0",
    documentation: "/api-docs",
    health: "/health",
    endpoints: {
      auth: "/api/auth"
    }
  });
});

// Swagger API Documentation
if (isSwaggerEnabled) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "IELTS LMS API Documentation",
    customJs: '/swagger-clear-auth.js',
    swaggerOptions: {
      persistAuthorization: false,
      displayRequestDuration: true,
      filter: true,
      syntaxHighlight: {
        activate: true,
        theme: "agate"
      }
    }
  }));
  
  // Serve custom JS to clear authorization on page load
  app.get('/swagger-clear-auth.js', (req, res) => {
    res.type('application/javascript');
    res.send(`
      // Clear any saved authorization on page load
      (function() {
        localStorage.removeItem('authorized');
        sessionStorage.clear();
        // Clear Swagger UI auth
        if (window.ui && window.ui.authActions) {
          window.ui.authActions.logout(['bearerAuth']);
        }
      })();
    `);
  });
  
  console.log("✓ Swagger UI enabled at /api-docs");
} else {
  console.log("✗ Swagger UI disabled (NODE_ENV=" + process.env.NODE_ENV + ")");
}

// API Routes - User Authentication only
app.use("/api/auth", require("./routes/auth.routes"));

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    errors: [],
  });
});

// Global Error Handler - Standard format
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Handle operational errors (AppError)
  if (isAppError(err)) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.details ? [{ message: err.message, field: err.details }] : [],
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.keys(err.errors).map(key => ({
      message: err.errors[key].message,
      field: key
    }));
    return res.status(400).json({
      success: false,
      message: null,
      errors,
    });
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      errors: [{ message: `${field} already exists`, field }],
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      errors: [],
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      errors: [],
    });
  }

  // Default error response for unknown errors
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
    errors: [],
  });
});

module.exports = app;
