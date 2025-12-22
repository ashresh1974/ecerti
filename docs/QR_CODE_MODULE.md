# QR Code Module Documentation

## Overview
The QR Code Module provides secure verification functionality for certificates through QR code generation and scanning. It enables users to verify certificate authenticity instantly using mobile devices or QR scanners.

## Features
- QR code generation for certificates
- Secure verification URLs
- Verification logging and tracking
- Mobile-friendly verification pages
- Anti-tampering protection

## Architecture

### Components
- **Generator**: Creates QR codes using qrcode library
- **Storage**: PNG file storage system
- **Verification**: Web-based verification interface
- **Logging**: Tracks all verification attempts
- **Security**: Token-based authentication

## System Architecture

### Complete Certificate Generation Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     CERTIFICATE GENERATION SYSTEM                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │ STUDENT / USER SIDE                                             │     │
│  ├─────────────────────────────────────────────────────────────────┤     │
│  │                                                                 │     │
│  │  1. Apply for Certificate                                       │     │
│  │     ├─ Select Certificate Type (Bonafide/Conduct/Scholarship)   │     │
│  │     ├─ Submit Application                                       │     │
│  │     └─ Wait for Admin Approval                                  │     │
│  │                                                                 │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│              ↓                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ADMIN DASHBOARD                                                 │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                 │   │
│  │  2. Review Certificate Request                                 │   │
│  │     ├─ View Student Details                                    │   │
│  │     ├─ Verify Information                                      │   │
│  │     └─ Approve/Reject                                          │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│              ↓                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ BACKEND - PDF GENERATION                                        │   │
│  │ (certificateController.js)                                      │   │
├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                 │   │
│  │  3. Generate Certificate PDF                                   │   │
│  │     ├─ Create Reference Number (6 chars, unique)               │   │
│  │     ├─ Fetch Certificate Data from Database                    │   │
│  │     ├─ Generate QR Code:                                       │   │
│  │     │  ├─ URL: http://localhost:3000/verify/{ref}             │   │
│  │     │  ├─ Size: 300x300 pixels                                 │   │
│  │     │  ├─ Error Correction: Level H                            │   │
│  │     │  ├─ Margin: 2px                                          │   │
│  │     │  └─ Convert to Base64 Image                              │   │
│  │     │                                                           │   │
│  │     ├─ Select HTML Template:                                   │   │
│  │     │  ├─ bonafide-certificate.html                            │   │
│  │     │  ├─ conduct-certificate.html                             │   │
│  │     │  └─ scholarship-bonafide-certificate.html                │   │
│  │     │                                                           │   │
│  │     ├─ Replace Template Placeholders:                          │   │
│  │     │  ├─ {{SL_NO}} → CERT-2024-001 (serial_num)              │   │
│  │     │  ├─ {{DATE}} → 15-01-2024 (issued_date)                 │   │
│  │     │  ├─ {{STUDENT_NAME}} → Full Name                         │   │
│  │     │  ├─ {{ROLL_NO}} → Roll Number                            │   │
│  │     │  ├─ {{SO_DO}} → S/o or D/o (gender-based)               │   │
│  │     │  ├─ {{PARENT_NAME}} → Parent Name                        │   │
│  │     │  ├─ {{BRANCH}} → Branch                                  │   │
│  │     │  ├─ {{COURSE}} → Course                                  │   │
│  │     │  ├─ {{PRESENT_YEAR}} → Year                              │   │
│  │     │  ├─ {{QR_CODE_BASE64}} → QR Image                        │   │
│  │     │  └─ {{HE_SHE}} → Gender pronoun                          │   │
│  │     │                                                           │   │
│  │     ├─ Render HTML to PDF (using Puppeteer)                    │   │
│  │     ├─ Save PDF to backend/public/certificates/                │   │
│  │     │  └─ Filename: {reference_num}.pdf                        │   │
│  │     │                                                           │   │
│  │     └─ Save QR Code to backend/public/qr-codes/                │   │
│  │        └─ Filename: {reference_num}.png                        │   │
│  │                                                                 │   │
│  │  4. Return Certificate to Student                              │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│              ↓                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ STUDENT / PUBLIC - QR SCANNING                                  │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                 │   │
│  │  5. User Scans QR Code                                         │   │
│  │     ├─ Open Camera/QR Scanner App                              │   │
│  │     ├─ Point at QR in Certificate PDF                          │   │
│  │     ├─ QR Scanner Decodes URL                                  │   │
│  │     └─ Automatically Opens Browser                             │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│              ↓                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ VERIFICATION PAGE                                               │   │
│  │ (http://localhost:3000/verify/{reference_num})                 │   │
├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                 │   │
│  │  6. Verification Page Opens (VerifyCertificate.jsx)            │   │
│  │                                                                 │   │
│  │     ┌─────────────────────────────────────────┐                │   │
│  │     │ ✓ Certificate Verification              │                │   │
│  │     ├─────────────────────────────────────────┤                │   │
│  │     │                                         │                │   │
│  │     │ [VERIFIED Badge - Green Checkmark]      │                │   │
│  │     │                                         │                │   │
│  │     │ ┌───────────────────────────────────┐   │                │   │
│  │     │ │ Certified by: UCET & MGU          │   │ ← Organization │   │
│  │     │ │ (Blue Gradient Background)        │   │   Certification │   │
│  │     │ └───────────────────────────────────┘   │                │   │
│  │     │                                         │                │   │
│  │     │ Certificate Information                │                │   │
│  │     │ ─────────────────────────────────────  │                │   │
│  │     │ Certificate Type: Bonafide             │                │   │
│  │     │ Name: Raj Kumar                        │                │   │
│  │     │ Roll Number: 19CS001                   │                │   │
│  │     │ Parent: S/o Ram Singh                  │                │   │
│  │     │ Course: B.Tech                         │                │   │
│  │     │ Branch: Computer Science               │                │   │
│  │     │ Duration: 4 years                      │                │   │
│  │     │ Issue Date: 15-01-2024                 │                │   │
│  │     │                                         │                │   │
│  │     │ Reference: ABC123DEF456                │                │   │
│  │     │ Serial Number: CERT-2024-001           │                │   │
│  │     │                                         │                │   │
│  │     │ [📄 View PDF] [🖨️  Print]              │                │   │
│  │     │                                         │                │   │
│  │     └─────────────────────────────────────────┘                │   │
│  │                                                                 │   │
│  │  7. Backend API Call                                           │   │
│  │     GET /api/certificate/verify/{reference_num}                │   │
│  │     ├─ Validate Reference Number                              │   │
│  │     ├─ Query Database                                          │   │
│  │     ├─ Log Verification:                                      │   │
│  │     │  ├─ Reference Number                                    │   │
│  │     │  ├─ IP Address                                          │   │
│  │     │  ├─ User Agent (Device Info)                            │   │
│  │     │  └─ Timestamp                                           │   │
│  │     └─ Return Certificate Data (JSON)                          │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│              ↓                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ADMIN - VERIFICATION LOGS                                       │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                 │   │
│  │  8. Admin Views QR Verification Logs                           │   │
│  │     GET /api/certificate/qr-logs                               │   │
│  │                                                                 │   │
│  │     ┌───────────────────────────────────────┐                 │   │
│  │     │ QR Verification Logs                  │                 │   │
│  │     ├───────────────────────────────────────┤                 │   │
│  │     │ Ref# │ Date/Time │ IP Address │ Dev  │                 │   │
│  │     ├───────────────────────────────────────┤                 │   │
│  │     │ABC12 │ 20-01-24  │ 192.168.1  │ Chro │                 │   │
│  │     │      │ 15:30:45  │ .100       │ me   │                 │   │
│  │     └───────────────────────────────────────┘                 │   │
│  │                                                                 │   │
│  │  ✓ Audit Trail Complete                                        │   │
│  │  ✓ Fraud Detection Enabled                                    │   │
│  │  ✓ Verification History Tracked                                │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
┌─────────────────┐
│  Student        │
│  Application    │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────┐
│  Admin Approves Request         │
│  ├─ Validate Data              │
│  └─ Generate Certificate ID    │
└────────┬────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Backend PDF Generation              │
│  ├─ Reference: ABC123              │
│  ├─ Serial Num: CERT-2024-001     │
│  ├─ Generate QR:                   │
│  │  └─ URL + Error Correction     │
│  ├─ Get Template                   │
│  ├─ Replace Placeholders           │
│  ├─ Render to PDF                  │
│  └─ Save Files                     │
└────────┬─────────────────────────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌───────┐  ┌─────────┐
│ PDF   │  │ QR Code │
│ File  │  │ Image   │
└───┬───┘  └────┬────┘
    │           │
    └─────┬─────┘
          │
          ↓
    ┌──────────────┐
    │ Certificate  │
    │ Ready for    │
    │ Download     │
    └──────┬───────┘
           │
           ↓
    ┌──────────────────┐
    │ Student Gets PDF │
    │ with QR Code     │
    └──────┬───────────┘
           │
           ↓
    ┌──────────────────┐
    │ User Scans QR    │
    │ with Smartphone  │
    └──────┬───────────┘
           │
           ↓
    ┌────────────────────────────┐
    │ Browser Opens Verify URL   │
    │ /verify/{reference_num}    │
    └──────┬─────────────────────┘
           │
           ↓
    ┌────────────────────────────┐
    │ Frontend Fetches Data      │
    │ /api/certificate/verify... │
    └──────┬─────────────────────┘
           │
           ↓
    ┌────────────────────────────┐
    │ Backend Queries Database   │
    │ & Logs Verification        │
    └──────┬─────────────────────┘
           │
           ↓
    ┌────────────────────────────┐
    │ Return Certificate Data    │
    │ + Verification Status      │
    └──────┬─────────────────────┘
           │
           ↓
    ┌────────────────────────────┐
    │ Render Verification Page   │
    │ ✓ VERIFIED                │
    │ Org Banner (UCET & MGU)   │
    │ All Details               │
    └────────────────────────────┘
```

## QR Code Generation

### Process Flow
1. Certificate creation triggers QR generation
2. Unique verification URL created
3. QR code image generated from URL
4. PNG file saved to storage
5. Path stored in certificate record

### URL Structure
```
/verify-certificate?id={certificate_id}&token={verification_token}
```

### Token Generation
- Cryptographically secure random string
- 32-character hexadecimal token
- Stored with certificate for validation
- Single-use or time-limited options

## Technical Implementation

### QR Code Creation
```javascript
const QRCode = require('qrcode');
const verificationUrl = `https://domain.com/verify-certificate?id=${certificateId}&token=${token}`;

await QRCode.toFile(qrPath, verificationUrl, {
    type: 'png',
    width: 200,
    errorCorrectionLevel: 'M'
});
```

### File Storage
```
public/qr-codes/
├── 2024/
│   ├── 01/
│   │   ├── qr_1001.png
│   │   ├── qr_1002.png
```

### Database Integration
```sql
ALTER TABLE certificates ADD COLUMN qr_code_path VARCHAR(255);
ALTER TABLE certificates ADD COLUMN verification_token VARCHAR(64);
```

## Verification System

### Web Interface
- Public verification page
- Certificate details display
- Verification status indicators
- Mobile-responsive design

### API Endpoints
```
GET /api/certificates/verify/:id
- Query: { token: string }
- Response: { isValid: boolean, certificate: object, logs: array }
```

### Verification Process
1. User scans QR code
2. Browser opens verification URL
3. System validates token and certificate
4. Displays certificate information
5. Logs verification attempt

## Security Features

### Token Validation
- Certificate ID and token matching
- Token expiration (optional)
- Single-use tokens (configurable)
- Tamper detection

### Access Control
- Public verification (no authentication required)
- Rate limiting on verification attempts
- IP-based restrictions (optional)
- Audit logging

### Data Protection
- No sensitive information in QR codes
- Secure token generation
- Encrypted storage options

## Verification Logging

### Log Structure
```sql
CREATE TABLE qr_verification_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    certificate_id INT NOT NULL,
    verified_by VARCHAR(255),  -- Optional identifier
    verification_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_valid BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    FOREIGN KEY (certificate_id) REFERENCES certificates(id)
);
```

### Logged Information
- **Timestamp**: When verification occurred
- **IP Address**: Source IP for security tracking
- **User Agent**: Device/browser information
- **Success/Failure**: Verification outcome
- **Certificate ID**: Which certificate was verified

### Analytics
- Verification frequency per certificate
- Geographic distribution of verifications
- Device type statistics
- Time-based patterns

## Mobile Compatibility

### QR Scanning
- Compatible with all major QR scanners
- Mobile browser optimization
- Touch-friendly interface
- Fast loading times

### Responsive Design
- Adapts to different screen sizes
- Readable text on mobile devices
- Optimized button sizes
- Progressive web app features

## Error Handling

### Invalid QR Codes
- Malformed URLs
- Non-existent certificates
- Expired tokens
- Tampered codes

### System Errors
- Database connection issues
- File system errors
- Network timeouts
- Server errors

### User Feedback
- Clear error messages
- Troubleshooting guidance
- Contact information for support
- Alternative verification methods

## Performance Optimization

### Caching
- QR code image caching
- Certificate data caching
- Verification result caching
- CDN integration for images

### Database Optimization
- Indexed queries for logs
- Partitioned log tables
- Archive old logs
- Query optimization

### File System
- Organized directory structure
- File compression
- Cleanup routines
- Backup procedures

## Integration Points

### Certificate Generation
- Automatic QR creation during certificate generation
- Template integration
- Batch processing support

### User Interface
- Admin dashboard for verification logs
- Student certificate view with QR display
- Public verification page

### Email System
- QR code inclusion in certificate emails
- Verification notifications
- Alert system for suspicious activity

## Testing

### Unit Tests
- QR code generation
- Token validation
- URL parsing
- Error handling

### Integration Tests
- Full verification workflow
- Mobile scanning simulation
- Database logging
- Performance under load

### User Testing
- Mobile device compatibility
- Various QR scanner apps
- Network condition testing
- Accessibility testing

## Monitoring and Alerts

### System Health
- QR generation success rates
- Verification response times
- Error rates and patterns
- Storage usage monitoring

### Security Monitoring
- Unusual verification patterns
- Geographic anomalies
- High-frequency attempts
- Failed verification spikes

### Performance Metrics
- Average verification time
- Peak usage handling
- Cache hit rates
- Database query performance

## Configuration

### Environment Variables
- `QR_CODE_SIZE`: Default QR code dimensions
- `VERIFICATION_URL_BASE`: Base URL for verification links
- `QR_STORAGE_PATH`: File system path for QR images
- `TOKEN_EXPIRY_HOURS`: Token validity period

### Database Settings
- Log retention period
- Archive thresholds
- Index maintenance schedules

## Future Enhancements

### Advanced Features
- Dynamic QR codes with timestamps
- Encrypted QR data
- Multi-format codes ( Aztec, Data Matrix)
- Offline verification

### Security Improvements
- Blockchain-based verification
- Digital signatures
- Biometric authentication
- Advanced encryption

### User Experience
- Progressive web app
- Native mobile apps
- Voice-guided verification
- Augmented reality features

### Analytics
- Advanced reporting
- Machine learning anomaly detection
- Predictive maintenance
- Usage pattern analysis

## Troubleshooting

### Common Issues
- **QR Code Not Scanning**: Check image quality, size, contrast
- **Verification Failed**: Confirm token validity, certificate status
- **Slow Loading**: Check network, caching, server performance
- **Invalid Links**: Verify URL encoding, parameter passing

### Debug Tools
- QR code validators
- Network inspection tools
- Database query analyzers
- Performance monitoring dashboards

## Compliance and Standards

### QR Code Standards
- ISO/IEC 18004 compliance
- Error correction levels
- Data encoding standards

### Accessibility
- WCAG 2.1 compliance
- Screen reader support
- Keyboard navigation
- Color contrast requirements

### Security Standards
- OWASP guidelines
- Data protection regulations
- Audit trail requirements
- Encryption standards