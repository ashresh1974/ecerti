# Certificate Module Documentation

## Overview
The Certificate Module handles the generation, management, and verification of digital certificates in the e-Certificate System. It provides functionality for creating certificates from templates, integrating QR codes for verification, and managing certificate lifecycles.

## Features
- Certificate generation from HTML templates
- QR code integration for verification
- PDF generation and storage
- Certificate status management
- Bulk certificate operations
- Verification logging

## Architecture

### Components
- **Templates**: HTML/CSS certificate designs
- **Generator**: PDF creation using Puppeteer/PDFKit
- **QR Codes**: Verification links embedded in certificates
- **Storage**: File system and database tracking
- **Verification**: QR code scanning and validation

## Certificate Generation Process

### Template Selection
1. User selects certificate type (Bonafide, Conduct, etc.)
2. System loads appropriate HTML template
3. Populates template with user data
4. Applies CSS styling

### Content Population
- **Dynamic Fields**: Name, roll number, course, dates
- **Static Content**: Institution details, signatures
- **QR Code**: Embedded verification link
- **Certificate Number**: Unique identifier generation

### PDF Creation
1. HTML to PDF conversion using Puppeteer
2. High-quality rendering
3. File storage in certificates directory
4. Database record creation

## QR Code Integration

### QR Code Generation
- Unique verification URL per certificate
- Contains certificate ID and verification token
- Generated using qrcode library
- Stored as PNG file

### Verification Process
1. User scans QR code
2. Redirects to verification page
3. System validates certificate authenticity
4. Logs verification attempt
5. Displays certificate details

### Verification URL Structure
```
/verify-certificate?id={certificate_id}&token={verification_token}
```

## Database Schema

### certificates Table
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
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (template_id) REFERENCES templates(id)
);
```

### qr_verification_logs Table
```sql
CREATE TABLE qr_verification_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    certificate_id INT NOT NULL,
    verified_by VARCHAR(255),
    verification_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_valid BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (certificate_id) REFERENCES certificates(id)
);
```

## Certificate Templates

### Template Types
- **Bonafide Certificate**: Course completion verification
- **Conduct Certificate**: Character certificate
- **Scholarship Bonafide**: Financial aid verification

### Template Structure
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        /* Certificate styling */
    </style>
</head>
<body>
    <div class="certificate">
        <header>
            <h1>Institution Name</h1>
        </header>
        <main>
            <p>This is to certify that <span class="name">{{full_name}}</span>...</p>
            <!-- Dynamic content -->
        </main>
        <footer>
            <div class="qr-code">
                <img src="{{qr_code_url}}" alt="QR Code" />
            </div>
            <div class="signatures">
                <!-- Signature images -->
            </div>
        </footer>
    </div>
</body>
</html>
```

### Placeholder System
- `{{full_name}}`: Student full name
- `{{roll_number}}`: Roll number
- `{{course}}`: Course name
- `{{issue_date}}`: Certificate issue date
- `{{certificate_number}}`: Unique certificate ID

## API Endpoints

### Certificate Generation
```
POST /api/certificates/generate
- Body: { userId: number, templateId: number, purpose: string }
- Response: { certificateId: number, pdfUrl: string, qrUrl: string }
```

### Certificate Retrieval
```
GET /api/certificates
- Query: { userId: number, status: string }
- Response: [{ id, number, issueDate, status, pdfUrl, qrUrl }]

GET /api/certificates/:id
- Response: { certificate: object, verificationLogs: array }
```

### Certificate Management
```
PUT /api/certificates/:id/status
- Body: { status: 'active'|'revoked'|'expired' }
- Response: { message: string }

DELETE /api/certificates/:id
- Response: { message: string }
```

### QR Verification
```
GET /api/certificates/verify/:id
- Query: { token: string }
- Response: { isValid: boolean, certificate: object }
```

## File Storage Structure

### Certificate PDFs
```
public/certificates/
├── {year}/
│   ├── {month}/
│   │   ├── cert_{certificate_number}.pdf
```

### QR Code Images
```
public/qr-codes/
├── {year}/
│   ├── {month}/
│   │   ├── qr_{certificate_id}.png
```

### Signature Images
```
public/assets/signatures/
├── signature_1.png
├── signature_2.png
```

## Certificate Number Generation

### Format
- **Prefix**: CERT
- **Year**: Current year (YY)
- **Sequence**: 6-digit sequential number
- **Example**: CERT2400001

### Uniqueness
- Database constraint ensures uniqueness
- Sequential numbering prevents collisions
- Year-based reset option

## Status Management

### Certificate States
- **Active**: Valid and usable
- **Revoked**: Manually invalidated
- **Expired**: Past expiry date

### Automatic Updates
- Expiry date checking
- Status updates via scheduled jobs
- Notification system for expiring certificates

## Verification System

### QR Code Scanning
1. Mobile app or QR scanner reads code
2. Extracts verification URL
3. Makes API call to verification endpoint
4. Returns certificate authenticity status

### Verification Logging
- Timestamp of verification
- IP address and user agent
- Success/failure status
- Audit trail for security

### Public Verification Page
- Web interface for QR verification
- Certificate details display
- Verification history
- Download option

## Security Features

### Certificate Integrity
- Unique certificate numbers
- Digital signatures (future enhancement)
- Tamper-proof QR codes
- Verification logging

### Access Control
- User-specific certificate access
- Admin override capabilities
- Role-based permissions

### Data Protection
- Secure file storage
- Database encryption for sensitive data
- Backup and recovery procedures

## Performance Optimization

### Caching
- Template caching
- QR code caching
- Certificate metadata caching

### Batch Processing
- Bulk certificate generation
- Parallel PDF creation
- Queue-based processing

### Storage Management
- File compression
- CDN integration
- Automatic cleanup of old files

## Error Handling

### Generation Errors
- Template loading failures
- PDF creation errors
- File system errors
- Database transaction failures

### Verification Errors
- Invalid QR codes
- Expired certificates
- Database connection issues
- File not found errors

## Integration Points

### User Management
- Certificate requests from students
- Approval workflow for admins
- User notification system

### Template System
- Dynamic template loading
- Template version management
- Customization options

### Email System
- Certificate delivery notifications
- Verification confirmations
- Expiry reminders

## Testing

### Unit Tests
- Template rendering
- QR code generation
- Certificate number creation
- Status updates

### Integration Tests
- Full generation workflow
- Verification process
- File storage operations
- Database transactions

### User Acceptance Tests
- Certificate appearance
- QR code functionality
- Mobile verification
- Bulk operations

## Monitoring and Analytics

### Generation Metrics
- Certificates generated per day/week
- Template usage statistics
- Generation success/failure rates

### Verification Metrics
- QR scans per certificate
- Verification success rates
- Geographic distribution

### Performance Metrics
- Generation time
- File sizes
- Storage usage

## Future Enhancements

### Advanced Features
- Digital signatures
- Blockchain verification
- Multi-language support
- Custom certificate designs

### Integration
- Third-party verification services
- Mobile app integration
- API for external systems

### Security
- Certificate encryption
- Advanced verification methods
- Audit trail enhancements