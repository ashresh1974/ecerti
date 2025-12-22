# Backend Module Documentation

## Overview
The Backend Module is the server-side component of the e-Certificate System, built with Node.js and Express.js. It handles all server-side logic, API endpoints, database interactions, and business logic for the application.

## Architecture
- **Framework**: Express.js
- **Runtime**: Node.js
- **Database**: MySQL
- **Authentication**: Session-based with bcrypt for password hashing
- **Email Service**: Nodemailer for OTP and notifications
- **File Handling**: Multer for file uploads
- **PDF Generation**: PDFKit and Puppeteer for certificate generation

## Directory Structure
```
backend/
├── src/
│   ├── server.js              # Main server file
│   ├── config/
│   │   ├── db.js             # Database connection
│   │   └── mailer.js         # Email configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── certificateController.js  # Certificate operations
│   │   ├── templateController.js     # Template management
│   │   └── userController.js         # User management
│   ├── middlewares/
│   │   ├── errorHandler.js   # Error handling middleware
│   │   └── validateOtp.js    # OTP validation middleware
│   └── routes/
│       ├── auth.js           # Authentication routes
│       ├── certificate.js    # Certificate routes
│       ├── templates.js      # Template routes
│       └── user.js           # User routes
├── public/
│   ├── assets/
│   │   ├── signatures/       # Digital signatures
│   │   └── certificates/     # Generated certificates
│   └── qr-codes/             # QR code images
├── templates/                # Certificate templates
└── package.json              # Dependencies
```

## Key Components

### Server Configuration (server.js)
- Sets up Express application
- Configures middleware (CORS, sessions, body parsing)
- Defines routes
- Starts server on port 5000
- Handles static file serving

### Database Configuration (config/db.js)
- MySQL connection setup
- Connection pooling
- Error handling for database operations

### Controllers

#### Auth Controller (authController.js)
- User registration with OTP verification
- Login with session management
- Password reset functionality
- OTP generation and encryption/decryption
- Session validation

#### Certificate Controller (certificateController.js)
- Certificate generation using templates
- QR code integration
- PDF creation and storage
- Certificate retrieval and management

#### Template Controller (templateController.js)
- Template CRUD operations
- Template rendering
- Dynamic content insertion

#### User Controller (userController.js)
- User profile management
- Role-based access control
- User data retrieval

### Middlewares

#### Error Handler (errorHandler.js)
- Centralized error handling
- Logging and response formatting

#### OTP Validation (validateOtp.js)
- OTP decryption and verification
- Request validation for protected routes

### Routes
- RESTful API endpoints
- Route protection with middleware
- Input validation

## Security Features
- Password hashing with bcrypt
- OTP encryption with AES-256-CBC
- Session-based authentication
- Input validation and sanitization
- CORS configuration

## API Endpoints

### Authentication
- `POST /api/register/send-otp` - Send registration OTP
- `POST /api/register/verify-otp` - Verify registration OTP
- `POST /api/register` - Complete registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/me` - Get current user info
- `POST /api/forgot-password/send-otp` - Send password reset OTP
- `POST /api/forgot-password/verify-otp` - Verify password reset OTP
- `POST /api/reset-password` - Reset password

### Certificates
- `POST /api/certificates/generate` - Generate certificate
- `GET /api/certificates` - Get user certificates
- `GET /api/certificates/:id` - Get specific certificate

### Users
- `GET /api/users` - Get all users (admin)
- `PUT /api/users/:id` - Update user (admin)

### Templates
- `GET /api/templates` - Get available templates
- `POST /api/templates` - Create template (admin)

## Dependencies
- `express`: Web framework
- `mysql`: Database driver
- `bcrypt`: Password hashing
- `crypto`: Encryption utilities
- `nodemailer`: Email sending
- `multer`: File uploads
- `pdfkit`: PDF generation
- `puppeteer`: Headless browser for PDF
- `qrcode`: QR code generation
- `cors`: Cross-origin resource sharing
- `express-session`: Session management

## Environment Variables
- `DB_HOST`: Database host
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `EMAIL_USER`: Email service username
- `EMAIL_PASS`: Email service password
- `SESSION_SECRET`: Session encryption key

## Error Handling
- Try-catch blocks in all async operations
- Centralized error middleware
- Proper HTTP status codes
- Detailed error logging

## Performance Considerations
- Database connection pooling
- Efficient query optimization
- File caching for templates
- Session management optimization

## Testing
- Unit tests for controllers
- Integration tests for API endpoints
- Database transaction handling
- Error scenario testing

## Deployment
- Production environment configuration
- Process management with PM2
- SSL/TLS configuration
- Database backup strategies