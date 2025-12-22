# Database Module Documentation

## Overview
The Database Module manages all data persistence for the e-Certificate System using MySQL. It stores user information, certificates, templates, OTPs, and system logs with proper relationships and constraints.

## Database Schema

### Tables

#### users
Stores user account information and profiles.
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
    password VARCHAR(255) NOT NULL,  -- Hashed
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### otps
Stores encrypted OTPs for authentication.
```sql
CREATE TABLE otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(255) NOT NULL,  -- Encrypted
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### certificates
Stores generated certificate information.
```sql
CREATE TABLE certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    template_id INT NOT NULL,
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    status ENUM('active', 'revoked', 'expired') DEFAULT 'active',
    qr_code_path VARCHAR(255),
    pdf_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES templates(id)
);
```

#### templates
Stores certificate template configurations.
```sql
CREATE TABLE templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    html_content TEXT NOT NULL,
    css_styles TEXT,
    placeholders JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### certificate_requests
Stores student certificate requests.
```sql
CREATE TABLE certificate_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    template_id INT NOT NULL,
    purpose VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected', 'issued') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    processed_by INT NULL,
    remarks TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES templates(id),
    FOREIGN KEY (processed_by) REFERENCES users(id)
);
```

#### qr_verification_logs
Tracks QR code verification attempts.
```sql
CREATE TABLE qr_verification_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    certificate_id INT NOT NULL,
    verified_by VARCHAR(255),
    verification_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_valid BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (certificate_id) REFERENCES certificates(id) ON DELETE CASCADE
);
```

## Database Design Principles

### Normalization
- **1NF**: Atomic values, no repeating groups
- **2NF**: No partial dependencies
- **3NF**: No transitive dependencies
- Proper foreign key relationships

### Constraints
- Primary keys for unique identification
- Foreign keys for referential integrity
- Unique constraints for business rules
- Check constraints for data validation
- NOT NULL constraints for required fields

### Indexing
- Primary key indexes (automatic)
- Foreign key indexes for performance
- Composite indexes for common queries
- Full-text indexes for search functionality

## Data Types and Constraints

### User Data
- **Names**: VARCHAR(255) for full names
- **Identifiers**: VARCHAR with appropriate lengths
- **Contact Info**: VARCHAR for email/phone with validation
- **Passwords**: VARCHAR(255) for bcrypt hashes
- **Roles**: ENUM for controlled values

### Certificate Data
- **Dates**: DATE/DATETIME for temporal data
- **Status**: ENUM for state management
- **Files**: VARCHAR for file paths
- **Numbers**: VARCHAR for certificate numbers

### Security Data
- **OTPs**: VARCHAR(255) for encrypted values
- **Logs**: TEXT for detailed information
- **IP Addresses**: VARCHAR(45) for IPv4/IPv6

## Relationships

### One-to-Many
- Users → Certificates
- Users → Certificate Requests
- Templates → Certificates
- Templates → Certificate Requests

### Many-to-One
- Certificates → Users
- Certificate Requests → Users
- QR Logs → Certificates

### Self-Referencing
- Users (created_by, processed_by)

## Query Optimization

### Common Queries
```sql
-- User authentication
SELECT * FROM users WHERE email_id = ? OR username = ?

-- Certificate retrieval
SELECT c.*, u.full_name, t.name as template_name
FROM certificates c
JOIN users u ON c.user_id = u.id
JOIN templates t ON c.template_id = t.id
WHERE c.user_id = ?

-- Pending requests
SELECT cr.*, u.full_name, t.name as template_name
FROM certificate_requests cr
JOIN users u ON cr.user_id = u.id
JOIN templates t ON cr.template_id = t.id
WHERE cr.status = 'pending'
```

### Indexes
```sql
CREATE INDEX idx_users_email ON users(email_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_status ON certificates(status);
CREATE INDEX idx_requests_status ON certificate_requests(status);
CREATE INDEX idx_otps_email_expiry ON otps(email, expires_at);
```

## Data Integrity

### Triggers
- Automatic timestamp updates
- Audit logging for critical operations
- Cascade deletes for related records

### Transactions
- ACID compliance for multi-table operations
- Rollback on errors
- Consistent state maintenance

## Backup and Recovery

### Backup Strategy
- Daily automated backups
- Point-in-time recovery
- Offsite storage
- Test restores

### Recovery Procedures
- Database restoration scripts
- Data validation after restore
- Minimal downtime procedures

## Performance Considerations

### Connection Pooling
- Multiple connection management
- Load balancing
- Connection timeout handling

### Query Optimization
- EXPLAIN plan analysis
- Slow query logging
- Index maintenance

### Caching
- Query result caching
- Application-level caching
- Session data caching

## Security Measures

### Access Control
- User role-based permissions
- Database user privileges
- Network security (firewalls, VPN)

### Data Protection
- Password hashing (bcrypt)
- OTP encryption (AES-256-CBC)
- Sensitive data masking

### Audit Logging
- User action tracking
- Data modification logs
- Security event monitoring

## Maintenance

### Regular Tasks
- Index rebuilding
- Statistics updates
- Log rotation
- Space management

### Monitoring
- Performance metrics
- Error logging
- Usage statistics
- Health checks

## Migration Scripts

### Version Control
- Schema versioning
- Migration scripts
- Rollback procedures
- Data transformation

### Deployment
- Zero-downtime migrations
- Backward compatibility
- Testing environments

## Development Best Practices

### Naming Conventions
- Lowercase table names
- snake_case column names
- Meaningful constraint names
- Consistent prefixes

### Documentation
- Schema documentation
- Query documentation
- Change logs
- API references