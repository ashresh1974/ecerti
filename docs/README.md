# e-Certificate Management System

A comprehensive digital certificate management system built with React.js frontend, Node.js backend, and MySQL database. The system provides secure certificate generation, QR code verification, and complete administrative control.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure login with OTP verification
- **Certificate Generation**: Dynamic PDF certificates from HTML templates
- **QR Code Verification**: Instant certificate authenticity checking
- **Role-Based Access**: Separate interfaces for students and administrators
- **Email Integration**: Automated certificate delivery and notifications
- **Template System**: Customizable certificate designs

### Security Features
- Password hashing with bcrypt
- OTP encryption with AES-256-CBC
- Session-based authentication
- Input validation and sanitization
- SQL injection prevention

### Administrative Tools
- User management dashboard
- Certificate request approval workflow
- Bulk certificate generation
- System monitoring and logs
- Template management interface

## ⚡ Quick Start (3 Steps)

### Prerequisites
- Node.js (v16+), npm, MySQL Server (v8.0+)

### Step 1: Database Setup (5 minutes)
```sql
CREATE DATABASE ecertificate;
-- Run migration: SOURCE d:\ecerti\backend\database\migrations\001_add_certificate_templates.sql
```

### Step 2: Install Dependencies (3 minutes)
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Step 3: Start Services (1 minute)
```bash
# Terminal 1 - Backend
cd backend && node src/server.js

# Terminal 2 - Frontend  
cd frontend && npm start
```

**Success**: Server at `http://localhost:5000`, Frontend at `http://localhost:3000`

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React.js with React Router
- **Backend**: Node.js with Express.js
- **Database**: MySQL with connection pooling
- **Authentication**: Session-based with OTP
- **File Processing**: PDF generation with Puppeteer
- **Email Service**: Nodemailer with SMTP

### System Components
- **Authentication Module**: User registration, login, OTP verification
- **Certificate Module**: PDF generation, QR codes, verification
- **User Management**: Profile management, role-based access
- **Template System**: HTML/CSS certificate templates
- **Email System**: Automated notifications and delivery

## 📁 Project Structure

```
ecerti/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Business logic controllers
│   │   ├── middlewares/     # Express middlewares
│   │   ├── routes/         # API route definitions
│   │   ├── config/         # Database and email config
│   │   └── server.js       # Main server file
│   ├── public/             # Static assets and uploads
│   └── package.json
├── frontend/               # React.js client application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── admindashboard/ # Admin interface
│   │   ├── studentdashboard/ # Student interface
│   │   └── login/         # Authentication pages
│   ├── public/            # Static web assets
│   └── package.json
├── docs/                  # Comprehensive documentation
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MySQL Server (v8.0 or higher)
- Git

### Database Setup
1. Create MySQL database:
   ```sql
   CREATE DATABASE ecertificate;
   ```

2. Update database credentials in `backend/src/config/db.js`

### Backend Installation
```bash
cd backend
npm install
npm start
```

### Frontend Installation
```bash
cd frontend
npm install
npm start
```

### Environment Configuration
Create `.env` file in backend directory:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=ecertificate
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
SESSION_SECRET=your_session_secret
```

## 📖 Usage

### For Students
1. Register with email verification
2. Submit certificate requests
3. Download issued certificates
4. Verify certificates via QR codes

### For Administrators
1. Login to admin dashboard
2. Review and approve certificate requests
3. Generate certificates from templates
4. Manage users and system settings

## 🔗 API Documentation

### Authentication Endpoints
- `POST /api/register/send-otp` - Send registration OTP
- `POST /api/login` - User authentication
- `POST /api/forgot-password/send-otp` - Password reset

### Certificate Endpoints
- `POST /api/certificates/generate` - Generate certificate
- `GET /api/certificates` - List certificates
- `GET /api/certificates/verify/:id` - QR verification

### Administrative Endpoints
- `GET /api/users` - User management
- `GET /api/templates` - Template management

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - Complete documentation index
- **[BACKEND_MODULE.md](BACKEND_MODULE.md)** - Backend architecture and APIs
- **[FRONTEND_MODULE.md](FRONTEND_MODULE.md)** - Frontend application structure
- **[DATABASE_MODULE.md](DATABASE_MODULE.md)** - Database schema and design
- **[AUTHENTICATION_MODULE.md](AUTHENTICATION_MODULE.md)** - Authentication system
- **[CERTIFICATE_MODULE.md](CERTIFICATE_MODULE.md)** - Certificate generation
- **[QR_CODE_MODULE.md](QR_CODE_MODULE.md)** - QR verification system
- **[USER_MANAGEMENT_MODULE.md](USER_MANAGEMENT_MODULE.md)** - User management
- **[TEMPLATES_MODULE.md](TEMPLATES_MODULE.md)** - Template system

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Manual Testing Checklist
- User registration and login
- Certificate request submission
- Admin approval workflow
- PDF generation and download
- QR code verification
- Email delivery

## 🚀 Deployment

### Production Build
```bash
# Frontend build
cd frontend && npm run build

# Backend production start
cd backend && npm start
```

### Environment Setup
- Configure production database
- Set up SMTP for email delivery
- Configure SSL certificates
- Set up file storage (local or cloud)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines
- Follow existing code style
- Add documentation for new features
- Test thoroughly before submitting
- Use meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation in `docs/` directory
- Review existing issues on GitHub
- Create a new issue for bugs or feature requests

## 🔄 Version History

### v1.0.0
- Initial release
- Core certificate generation
- QR code verification
- Admin and student dashboards
- Email integration
- Template system

---

**Built with ❤️ for educational institutions**
**
