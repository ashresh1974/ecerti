# User Management Module Documentation

## Overview

The User Management Module handles user accounts, roles, permissions, and profile management in the e-Certificate System. It provides functionality for user registration, profile updates, role-based access control, and administrative user management.

## Features

- User registration and profile management
- Role-based access control (Student/Admin)
- Administrative user management
- Profile updates and password changes
- User activity tracking
- Account status management

## User Roles and Permissions

### Student Role

- **Certificate Requests**: Submit certificate requests
- **Certificate Access**: View and download issued certificates
- **Profile Management**: Update personal information
- **QR Verification**: Verify certificates via QR codes
- **Password Management**: Change password, reset password

### Admin Role
- **User Management**: View, edit, deactivate user accounts
- **Certificate Management**: Approve/reject requests, issue certificates
- **Template Management**: Create and manage certificate templates
- **System Monitoring**: View logs, system statistics
- **Bulk Operations**: Mass certificate generation, user imports
- **Security Management**: Monitor suspicious activities

## Database Schema

### users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    roll_number VARCHAR(20) UNIQUE NOT NULL,
    course VARCHAR(100) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    email_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### user_activity_logs Table
```sql
CREATE TABLE user_activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## User Registration Process

### Student Registration
1. **Email Verification**: OTP-based email verification
2. **Profile Creation**: Collect personal and academic details
3. **Account Activation**: Set default role as 'student'
4. **Welcome Email**: Send account confirmation

### Admin User Creation
1. **Manual Creation**: Admin creates account via dashboard
2. **Direct Setup**: No OTP verification for admin accounts
3. **Role Assignment**: Explicitly set role as 'admin'
4. **Initial Password**: Temporary password with change requirement

## Profile Management

### Editable Fields
- **Personal Information**: Name, gender, phone number
- **Academic Details**: Course, branch (limited editing)
- **Contact Information**: Email (with verification)
- **Security**: Password, security preferences

### Validation Rules
- **Email**: Format validation, uniqueness check
- **Phone**: 10-digit validation, uniqueness
- **Roll Number**: 12-digit format, uniqueness
- **Password**: Strength requirements, confirmation

## Administrative Functions

### User Search and Filtering
```javascript
// Search users by various criteria
GET /api/users?search=john&role=student&course=B.Tech&page=1&limit=10
```

### User Management Operations
- **View Details**: Complete user profile and activity
- **Edit Information**: Update user details with validation
- **Deactivate Account**: Soft delete with status change
- **Reset Password**: Force password reset for users
- **Role Changes**: Promote/demote user roles

### Bulk Operations
- **Import Users**: CSV upload for bulk user creation
- **Export Data**: User data export for reporting
- **Mass Updates**: Bulk status changes, role assignments

## Security and Access Control

### Authentication Middleware
```javascript
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    next();
};

const requireAdmin = (req, res, next) => {
    if (req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};
```

### Route Protection
- **Public Routes**: Registration, login, password reset
- **Student Routes**: Profile, certificates, requests
- **Admin Routes**: User management, system admin
- **API Routes**: Token-based authentication

### Session Management
- **Timeout**: 30 minutes of inactivity
- **Security**: HttpOnly cookies, secure flags
- **Concurrent Sessions**: Single session per user
- **Logout**: Complete session destruction

## API Endpoints

### User Profile
```
GET /api/users/profile
- Response: { user: object }

PUT /api/users/profile
- Body: { fullName, phone, course, branch }
- Response: { message: string, user: object }

PUT /api/users/change-password
- Body: { currentPassword, newPassword }
- Response: { message: string }
```

### Admin User Management
```
GET /api/users
- Query: { page, limit, search, role, status }
- Response: { users: array, total: number, pages: number }

GET /api/users/:id
- Response: { user: object, activity: array }

PUT /api/users/:id
- Body: { updates }
- Response: { message: string }

DELETE /api/users/:id
- Response: { message: string }

POST /api/users/bulk-import
- Body: FormData with CSV file
- Response: { imported: number, failed: number }
```

### User Activity
```
GET /api/users/:id/activity
- Query: { page, limit, dateFrom, dateTo }
- Response: { activities: array, total: number }
```

## Frontend Components

### Student Dashboard
- **Profile Section**: Personal information display/edit
- **Certificate Requests**: Submit and track requests
- **Issued Certificates**: View and download certificates
- **Settings**: Password change, preferences

### Admin Dashboard
- **User Management**: Search, view, edit users
- **Certificate Requests**: Approve/reject pending requests
- **System Statistics**: User counts, activity metrics
- **Bulk Operations**: Import/export functionality

### Profile Components
- **Edit Profile Form**: Validation and error handling
- **Password Change**: Current password verification
- **Avatar Upload**: Profile picture management
- **Activity Log**: Recent user actions

## Activity Logging

### Logged Actions
- **Authentication**: Login, logout, failed attempts
- **Profile Changes**: Updates to user information
- **Certificate Actions**: Requests, downloads, verifications
- **Admin Actions**: User modifications, system changes

### Log Structure
```javascript
{
    userId: 123,
    action: 'profile_updated',
    details: { changedFields: ['phone', 'course'] },
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    timestamp: '2024-01-15T10:30:00Z'
}
```

## Data Validation and Sanitization

### Input Validation
- **Server-side**: Comprehensive validation in controllers
- **Client-side**: Form validation with user feedback
- **Database**: Constraints and triggers for data integrity

### Data Sanitization
- **XSS Prevention**: HTML encoding, input sanitization
- **SQL Injection**: Parameterized queries, ORM protection
- **File Uploads**: Type validation, size limits

## Performance Optimization

### Database Queries
- **Indexing**: Optimized indexes on frequently queried fields
- **Pagination**: Efficient large dataset handling
- **Caching**: User data caching for performance

### API Optimization
- **Response Compression**: Gzip compression for large responses
- **Rate Limiting**: Prevent abuse of user management endpoints
- **Batch Operations**: Efficient bulk user operations

## Error Handling

### User Errors
- **Validation Errors**: Clear messages for invalid inputs
- **Permission Errors**: Access denied messages
- **Not Found Errors**: User not found scenarios

### System Errors
- **Database Errors**: Connection issues, constraint violations
- **File System Errors**: Upload failures, permission issues
- **Network Errors**: Timeout handling, retry logic

## Testing

### Unit Tests
- User model validation
- Authentication logic
- Permission checking
- Data sanitization

### Integration Tests
- User registration flow
- Profile update process
- Admin user management
- Activity logging

### Security Tests
- Authorization bypass attempts
- Input validation testing
- SQL injection prevention
- XSS vulnerability testing

## Monitoring and Analytics

### User Metrics
- **Registration Trends**: Daily/weekly signups
- **Active Users**: Login frequency, session duration
- **Role Distribution**: Student vs admin ratios
- **Geographic Data**: User location analytics

### Security Monitoring
- **Failed Logins**: Brute force detection
- **Suspicious Activity**: Unusual login patterns
- **Permission Changes**: Admin action auditing
- **Data Access**: Sensitive data access logging

## Compliance and Privacy

### Data Protection
- **GDPR Compliance**: Data minimization, consent management
- **Data Retention**: User data lifecycle management
- **Right to Deletion**: Account deletion functionality
- **Data Portability**: User data export features

### Privacy Features
- **Data Masking**: Sensitive data protection in logs
- **Consent Management**: Email communication preferences
- **Audit Trails**: Complete user action history
- **Anonymization**: Data anonymization for analytics

## Future Enhancements

### Advanced Features
- **User Groups**: Department-based user organization
- **Advanced Permissions**: Granular permission system
- **User Import/Export**: Enhanced bulk operations
- **Profile Completion**: Progress tracking for profile setup

### Security Improvements
- **Multi-Factor Authentication**: Additional security layers
- **Account Recovery**: Advanced password recovery options
- **Session Management**: Enhanced session controls
- **Audit Enhancements**: Detailed audit logging

### User Experience
- **Dashboard Customization**: Personalized user interfaces
- **Notification System**: In-app notifications and alerts
- **User Onboarding**: Guided setup process
- **Mobile Optimization**: Enhanced mobile experience
