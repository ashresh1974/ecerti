# Authentication Module Documentation

## Overview

The Authentication Module handles user registration, login, password reset, and session management for the e-Certificate System. It implements secure authentication with OTP verification, password hashing, and session-based authorization.

## Features

- User registration with email OTP verification
- Secure login with session management
- Password reset via email OTP
- Role-based access control (Student/Admin)
- Session timeout handling
- Automatic logout on inactivity

## Architecture

### Components

- **Frontend**: React components for login/register forms
- **Backend**: Express routes and controllers
- **Database**: MySQL tables for users and OTPs
- **Security**: bcrypt for passwords, AES encryption for OTPs

## User Registration Flow

### Step 1: Email Verification

1. User enters email address
2. System checks if email already exists
3. Generates 6-digit OTP
4. Encrypts OTP using AES-256-CBC
5. Stores encrypted OTP in database with expiration
6. Sends plain OTP to user's email

### Step 2: OTP Verification

1. User enters received OTP
2. System retrieves encrypted OTP from database
3. Decrypts stored OTP
4. Compares with user input
5. Deletes OTP record on successful verification

### Step 3: Account Creation

1. User provides additional details (name, roll, etc.)
2. Hashes password using bcrypt (10 rounds)
3. Creates user account in database
4. Sets default role as 'student'

## Login Process

### Authentication Steps

1. User provides email/username and password
2. System queries user by email or username
3. Compares provided password with stored hash using bcrypt
4. On success, creates session with user data
5. Returns user information and role

### Session Management

- Uses express-session middleware
- Stores user ID, email, role in session
- Session timeout: 30 minutes of inactivity
- Automatic cleanup on logout

## Password Reset Flow

### Reset Request

1. User enters email address
2. System verifies user exists
3. Generates and encrypts OTP
4. Stores in database with expiration
5. Sends OTP via email

### OTP Verification

1. User enters OTP
2. System decrypts and verifies OTP
3. Allows password change on success

### Password Update

1. User provides new password
2. Hashes new password with bcrypt
3. Updates user record in database
4. Deletes used OTP

## Security Implementation

### Password Security

- **Hashing**: bcrypt with 10 salt rounds
- **Storage**: VARCHAR(255) for hash storage
- **Comparison**: Timing-safe comparison

### OTP Security

- **Generation**: Cryptographically secure random numbers
- **Encryption**: AES-256-CBC with random IV
- **Storage**: Encrypted in database
- **Expiration**: 10 minutes validity
- **Single Use**: Deleted after verification

### Session Security

- **Storage**: Server-side session storage
- **Cookies**: HttpOnly, Secure flags
- **Timeout**: Automatic expiration
- **Validation**: Regular session checks

## API Endpoints

### Registration

```json
POST /api/register/send-otp
- Body: { email: string }
- Response: { message: string }

POST /api/register/verify-otp
- Body: { email: string, otp: string }
- Response: { message: string }

POST /api/register
- Body: { fullName, roll, course, branch, gender, mobile, email, username, password }
- Response: { message: string }
```

### Authentication

```json
POST /api/login
- Body: { email: string, password: string }
- Response: { message: string, user: object }

POST /api/logout
- Response: { message: string }

GET /api/me
- Response: { isValid: boolean, user: object }
```

### Password Reset

```json
POST /api/forgot-password/send-otp
- Body: { email: string }
- Response: { message: string }

POST /api/forgot-password/verify-otp
- Body: { email: string, otp: string }
- Response: { message: string }

POST /api/reset-password
- Body: { email: string, otp: string, newPassword: string }
- Response: { message: string }
```

## Frontend Components

### Registration Form

- Email input with validation
- OTP input (6 digits)
- Send/Verify OTP buttons
- Form validation and error display
- Success message styling

### Login Form

- Email/Username and password inputs
- Remember me option
- Error handling
- Loading states

### Password Reset

- Email input for OTP request
- OTP verification
- New password input
- Confirmation flow

## Database Tables

### users

- Stores user credentials and profile
- Password field: hashed with bcrypt
- Role field: student/admin permissions

### otps

- Temporary OTP storage
- OTP field: encrypted with AES-256-CBC
- Expiration: 10 minutes
- Email association

## Error Handling

### Common Errors

- **Invalid Credentials**: Wrong email/password
- **Expired OTP**: OTP validity exceeded
- **Invalid OTP**: Wrong OTP entered
- **User Exists**: Duplicate registration attempt
- **Session Expired**: Automatic logout

### Error Responses

- HTTP status codes (400, 401, 409, 500)
- Descriptive error messages
- Frontend error display

## Security Best Practices

### Input Validation

- Email format validation
- Password strength requirements
- OTP format (6 digits)
- SQL injection prevention

### Rate Limiting

- OTP request limits
- Login attempt limits
- Brute force protection

### Data Protection

- No plain text password storage
- Encrypted OTP storage
- Secure session handling
- HTTPS enforcement

## User Experience

### Registration Flow

1. Enter email → Send OTP
2. Enter OTP → Verify
3. Fill details → Create account
4. Success confirmation

### Login Flow

1. Enter credentials → Login
2. Session creation
3. Redirect to dashboard

### Password Reset Flow

1. Enter email → Send OTP
2. Enter OTP → Verify
3. Enter new password → Reset
4. Success confirmation

## Testing Scenarios

### Unit Tests

- Password hashing verification
- OTP encryption/decryption
- Session creation/validation

### Integration Tests

- Complete registration flow
- Login/logout cycle
- Password reset process

### Security Tests

- SQL injection attempts
- Brute force protection
- Session hijacking prevention

## Monitoring and Logging

### Authentication Logs

- Login attempts (success/failure)
- Registration events
- Password reset requests
- Session activities

### Security Alerts

- Multiple failed login attempts
- Suspicious OTP requests
- Session anomalies

## Configuration

### Environment Variables

- `SESSION_SECRET`: Session encryption key
- `OTP_ENCRYPTION_KEY`: OTP encryption key (optional)
- `EMAIL_USER/EMAIL_PASS`: Email credentials

### Timeout Settings

- Session timeout: 30 minutes
- OTP validity: 10 minutes
- Password reset window: 1 hour

## Future Enhancements

### Two-Factor Authentication

- SMS OTP option
- Authenticator app integration
- Hardware security keys

### Advanced Security

- Account lockout policies
- Password history checks
- Security question fallback

### User Experience

- Remember me functionality
- Social login options
- Account verification emails