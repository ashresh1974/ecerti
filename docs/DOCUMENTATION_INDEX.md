# Documentation Index

Project status: Implementation complete

This index provides organized access to all documentation for the e-Certificate Management System.

## Quick Start

- `README.md` — Project overview, quick start guide, and setup instructions

## Module Documentation

### Core System Modules
- `BACKEND_MODULE.md` — Backend architecture, APIs, and server-side logic
- `FRONTEND_MODULE.md` — Frontend React application structure and components
- `DATABASE_MODULE.md` — Database schema, relationships, and optimization
- `AUTHENTICATION_MODULE.md` — User authentication, OTP, and session management
- `CERTIFICATE_MODULE.md` — Certificate generation, management, and verification
- `QR_CODE_MODULE.md` — QR code generation and verification system (with complete architecture)
- `EMAIL_MAILER_MODULE.md` — Email delivery system and templates
- `USER_MANAGEMENT_MODULE.md` — User accounts, roles, and profile management
- `TEMPLATES_MODULE.md` — Certificate template creation and management system

### System Overview
- `CERTIFICATE_SYSTEM.md` — Certificate system overview and features
- `CERTIFICATE_SYSTEM_OFFICIAL_DESIGN.md` — System design specifications
- `CERTIFICATE_SYSTEM_COMPLETE_CHECKLIST.md` — Implementation checklist

## Developer Resources

### Setup and Configuration
- `QUICK_START_3_STEPS.md` — 3-step deployment guide (removed - content in README.md)
- `INTEGRATION_FINAL_STEPS.md` — Full setup and troubleshooting
- `CERTIFICATE_TEMPLATES_SETUP.md` — Template setup guide

### Technical Implementation
- `IMPLEMENTATION_SUMMARY_COMPLETE.md` — Architecture and code notes
- `FINAL_STATUS_REPORT.md` — Executive summary and diagrams
- `QR_CODE_COMPLETE_IMPLEMENTATION.md` — QR code implementation details
- `QR_CODE_ENHANCEMENT_SUMMARY.md` — QR code enhancements
- `QR_USER_EXPERIENCE_GUIDE.md` — QR verification user experience

## Developer Commands

```bash
# Database migration example
mysql -h localhost -u root -p ecertificate < backend/database/migrations/001_add_certificate_templates.sql

# Start services
cd backend && node src/server.js    # Backend server (port 5000)
cd frontend && npm start           # Frontend app (port 3000)
```

# install backend deps
cd backend && npm install

# start backend
cd backend && node src/server.js

# start frontend
cd frontend && npm start
```

## File highlights

- `backend/src/controllers/certificateController.js` — PDF and QR logic
- `backend/src/controllers/templateController.js` — template CRUD
- `backend/database/migrations/001_add_certificate_templates.sql` — DB schema
- `frontend/src/admindashboard/RequestDetails.jsx` — template selector UI
- `frontend/src/pages/VerifyCertificate.jsx` — public verification page

## API Reference

### Authentication
- `POST /api/register/send-otp` — Send registration OTP
- `POST /api/register/verify-otp` — Verify registration OTP
- `POST /api/login` — User authentication
- `POST /api/forgot-password/send-otp` — Password reset OTP

### Certificates
- `POST /api/certificates/generate` — Generate certificate
- `GET /api/certificates` — List user certificates
- `GET /api/certificates/verify/:id` — QR verification

### Templates
- `GET /api/templates` — List available templates
- `POST /api/templates` — Create new template

### Users (Admin)
- `GET /api/users` — List all users
- `PUT /api/users/:id` — Update user details

If you'd like, I can run a quick smoke test of the API endpoints now (templates list, verification endpoint, approve-with-template).


