# Email/Mailer Module Documentation

## Overview

The Email/Mailer Module handles all email communications in the e-Certificate System, including OTP delivery, certificate notifications, and system alerts. It uses Nodemailer for reliable email delivery with proper error handling and logging.

## Features

- OTP email delivery for authentication
- Certificate distribution notifications
- System status alerts
- HTML email templates
- Delivery tracking and logging
- SMTP configuration

## Architecture

### Components

- **Mailer Configuration**: SMTP setup with Nodemailer
- **Template System**: HTML email templates
- **Queue System**: Email sending queue
- **Logging**: Delivery status tracking
- **Error Handling**: Retry mechanisms and fallbacks

## Email Types

### Authentication Emails

- **Registration OTP**: 6-digit code for account creation
- **Password Reset OTP**: Code for password recovery
- **Login Notifications**: Security alerts for login attempts

### Certificate Emails

- **Certificate Issued**: PDF attachment with certificate
- **Certificate Ready**: Download link notification
- **Expiry Reminders**: Upcoming certificate expiration
- **Revocation Notices**: Certificate invalidation alerts

### System Emails

- **Admin Alerts**: System errors, security issues
- **User Notifications**: Account changes, updates
- **Bulk Communications**: Announcements, updates

## Technical Implementation

### Nodemailer Configuration

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
```

### Email Templates

#### OTP Email Template

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .otp-code { font-size: 24px; font-weight: bold; color: #007bff; }
    </style>
</head>
<body>
    <h2>e-Certificate System - OTP Verification</h2>
    <p>Your OTP for {{purpose}} is:</p>
    <div class="otp-code">{{otp}}</div>
    <p>This OTP is valid for 10 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
</body>
</html>
```

#### Certificate Email Template

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        .certificate-link { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; }
    </style>
</head>
<body>
    <h2>Your Certificate is Ready</h2>
    <p>Dear {{full_name}},</p>
    <p>Your {{certificate_type}} certificate has been issued.</p>
    <p><a href="{{download_link}}" class="certificate-link">Download Certificate</a></p>
    <p>Certificate Number: {{certificate_number}}</p>
</body>
</html>
```

## Email Sending Process

### OTP Delivery

1. Generate OTP and encrypt for storage
2. Create email content with plain OTP
3. Send email via SMTP
4. Log delivery status
5. Handle failures with retry logic

### Certificate Delivery

1. Generate certificate PDF
2. Create email with attachment or download link
3. Send to user email
4. Update certificate status
5. Log delivery confirmation

## Error Handling and Retry Logic

### Delivery Failures

- **Network Issues**: Automatic retry with exponential backoff
- **Invalid Recipients**: Email validation before sending
- **SMTP Errors**: Fallback SMTP servers
- **Rate Limiting**: Queue management for bulk emails

### Retry Strategy

```javascript
const sendEmailWithRetry = async (mailOptions, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            await transporter.sendMail(mailOptions);
            return { success: true };
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
    }
};
```

## Logging and Monitoring

### Email Logs

```sql
CREATE TABLE email_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    email_type VARCHAR(50) NOT NULL,
    status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
    sent_at TIMESTAMP NULL,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Monitoring Metrics

- **Delivery Rate**: Percentage of successful sends
- **Bounce Rate**: Invalid email addresses
- **Open Rate**: Email engagement (if tracked)
- **Response Time**: SMTP server response times

## Security Features

### Email Validation

- Format validation using regex
- Domain verification
- Disposable email detection
- Blacklist checking

### Content Security

- HTML sanitization
- Attachment scanning
- Link validation
- Spam prevention

### Authentication

- SMTP authentication
- DKIM/SPF setup
- TLS encryption
- Secure credential storage

## Configuration

### Environment Variables

- `EMAIL_HOST`: SMTP server hostname
- `EMAIL_PORT`: SMTP server port (587/465/25)
- `EMAIL_USER`: SMTP username
- `EMAIL_PASS`: SMTP password
- `EMAIL_FROM`: Default sender address
- `EMAIL_SECURE`: TLS/SSL setting

### SMTP Providers

- **Gmail**: smtp.gmail.com:587
- **Outlook**: smtp-mail.outlook.com:587
- **SendGrid**: smtp.sendgrid.net:587
- **Mailgun**: smtp.mailgun.org:587

## API Integration

### Email Service Endpoints

```
POST /api/email/send-otp
- Body: { email: string, otp: string, type: string }
- Response: { message: string, messageId: string }

POST /api/email/send-certificate
- Body: { email: string, certificateId: number, attachment: boolean }
- Response: { message: string, messageId: string }
```

### Status Checking

```
GET /api/email/status/:messageId
- Response: { status: string, delivered: boolean, opened: boolean }
```

## Performance Optimization

### Queue Management

- Email queuing for bulk operations
- Rate limiting to prevent spam
- Priority queuing for urgent emails
- Background processing

### Caching

- Template caching
- SMTP connection pooling
- DNS resolution caching
- Content optimization

## Testing

### Email Testing

- **Unit Tests**: Template rendering, validation
- **Integration Tests**: SMTP connection, delivery
- **End-to-End Tests**: Complete email workflows

### Test Environments

- **Development**: Console logging instead of sending
- **Staging**: Test SMTP servers (Mailtrap, MailHog)
- **Production**: Real SMTP with monitoring

## Compliance and Regulations

### Email Regulations

- **CAN-SPAM**: Commercial email requirements
- **GDPR**: Data protection and consent
- **CASL**: Canadian anti-spam legislation
- **Email Authentication**: DKIM, SPF, DMARC

### Privacy Considerations

- Opt-in/opt-out management
- Data minimization
- Consent tracking
- Unsubscribe functionality

## Troubleshooting

### Common Issues

- **Authentication Failed**: Check SMTP credentials
- **Connection Timeout**: Verify firewall, network settings
- **High Bounce Rate**: Clean email list, verify addresses
- **Spam Folder**: Improve content, setup authentication

### Debug Tools

- SMTP connection testers
- Email header analyzers
- Delivery status checkers
- Log analysis tools

## Future Enhancements

### Advanced Features

- **Transactional Emails**: Template management system
- **Email Analytics**: Open tracking, click tracking
- **A/B Testing**: Content optimization
- **Personalization**: Dynamic content insertion

### Integration

- **Email Service Providers**: SendGrid, Mailgun, AWS SES
- **CRM Integration**: Customer data synchronization
- **Marketing Automation**: Campaign management
- **SMS Fallback**: Multi-channel communication

### Security

- **Email Encryption**: S/MIME, PGP
- **Two-Factor Authentication**: Email-based 2FA
- **Phishing Protection**: Link validation, content scanning
- **Audit Trails**: Comprehensive logging

## Maintenance

### Regular Tasks

- **Log Rotation**: Archive old email logs
- **Bounce Handling**: Remove invalid addresses
- **Reputation Monitoring**: Track sender reputation
- **Template Updates**: Refresh email designs

### Monitoring

- **Uptime Monitoring**: SMTP server availability
- **Performance Metrics**: Delivery times, success rates
- **Error Tracking**: Failed delivery analysis
- **Security Alerts**: Unusual sending patterns

