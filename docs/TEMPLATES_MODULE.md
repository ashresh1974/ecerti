# Templates Module Documentation

## Overview

The Templates Module manages certificate templates used for generating digital certificates. It provides functionality for creating, editing, and managing HTML/CSS templates with dynamic content placeholders for personalized certificates.

## Features

- HTML/CSS certificate template creation
- Dynamic content placeholder system
- Template versioning and management
- Preview functionality
- Template categorization and organization
- Bulk template operations

## Template Architecture

### Template Components

- **HTML Structure**: Certificate layout and design
- **CSS Styling**: Visual appearance and branding
- **Placeholders**: Dynamic content insertion points
- **Assets**: Images, signatures, logos
- **Metadata**: Template information and settings

### Template Storage

```text
public/templates/
├── bonafide-certificate.html
├── conduct-certificate.html
├── scholarship-bonafide-certificate.html
└── custom-templates/
    ├── template_1.html
    └── template_2.html
```

## Template Structure

### HTML Template Example
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate of {{certificate_type}}</title>
    <style>
        {{css_styles}}
    </style>
</head>
<body>
    <div class="certificate-container">
        <header class="certificate-header">
            <div class="institution-logo">
                <img src="{{logo_url}}" alt="Institution Logo" />
            </div>
            <h1 class="institution-name">{{institution_name}}</h1>
            <h2 class="certificate-title">{{certificate_title}}</h2>
        </header>

        <main class="certificate-body">
            <div class="certificate-content">
                <p class="certification-text">
                    This is to certify that <strong>{{full_name}}</strong>,
                    Roll Number: <strong>{{roll_number}}</strong>,
                    of <strong>{{course}} {{branch}}</strong> has successfully
                    completed the requirements and is hereby awarded this
                    <strong>{{certificate_type}}</strong>.
                </p>

                <div class="certificate-details">
                    <div class="detail-row">
                        <span class="label">Date of Issue:</span>
                        <span class="value">{{issue_date}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Certificate Number:</span>
                        <span class="value">{{certificate_number}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Valid Until:</span>
                        <span class="value">{{expiry_date}}</span>
                    </div>
                </div>
            </div>

            <div class="qr-code-section">
                <img src="{{qr_code_url}}" alt="QR Code for Verification" class="qr-code" />
                <p class="qr-text">Scan to verify authenticity</p>
            </div>
        </main>

        <footer class="certificate-footer">
            <div class="signatures">
                <div class="signature-block">
                    <img src="{{signature_1_url}}" alt="Director Signature" class="signature-image" />
                    <div class="signature-line"></div>
                    <p class="signature-title">Director</p>
                </div>
                <div class="signature-block">
                    <img src="{{signature_2_url}}" alt="Principal Signature" class="signature-image" />
                    <div class="signature-line"></div>
                    <p class="signature-title">Principal</p>
                </div>
            </div>

            <div class="certificate-seal">
                <img src="{{seal_url}}" alt="Institution Seal" class="seal-image" />
            </div>
        </footer>
    </div>
</body>
</html>
```

## Placeholder System

### Available Placeholders

- **Student Information**
  - `{{full_name}}`: Student's full name
  - `{{roll_number}}`: Student roll number
  - `{{course}}`: Course name
  - `{{branch}}`: Branch/specialization
  - `{{gender}}`: Student gender

- **Certificate Details**
  - `{{certificate_type}}`: Type of certificate
  - `{{certificate_title}}`: Certificate title
  - `{{certificate_number}}`: Unique certificate number
  - `{{issue_date}}`: Date of issuance
  - `{{expiry_date}}`: Expiration date

- **Institution Details**
  - `{{institution_name}}`: Institution full name
  - `{{institution_address}}`: Institution address
  - `{{logo_url}}`: Institution logo URL
  - `{{seal_url}}`: Institution seal URL

- **Signatures and Assets**
  - `{{signature_1_url}}`: First signature image
  - `{{signature_2_url}}`: Second signature image
  - `{{qr_code_url}}`: QR code image URL

- **Styling**
  - `{{css_styles}}`: Inline CSS styles

## Database Schema

### templates Table
```sql
CREATE TABLE templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    html_content LONGTEXT NOT NULL,
    css_styles LONGTEXT,
    placeholders JSON,
    thumbnail_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### template_versions Table
```sql
CREATE TABLE template_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT NOT NULL,
    version_number INT NOT NULL,
    html_content LONGTEXT NOT NULL,
    css_styles LONGTEXT,
    changes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

## Template Management

### CRUD Operations
- **Create**: New template with HTML/CSS content
- **Read**: Retrieve template details and content
- **Update**: Modify existing templates
- **Delete**: Soft delete with status change

### Version Control
- **Version Tracking**: Save changes as new versions
- **Rollback**: Revert to previous versions
- **Change History**: Track modifications and authors

## API Endpoints

### Template Management
```
GET /api/templates
- Query: { type, active, page, limit }
- Response: { templates: array, total: number }

GET /api/templates/:id
- Response: { template: object, versions: array }

POST /api/templates
- Body: { name, type, htmlContent, cssStyles, placeholders }
- Response: { templateId: number, message: string }

PUT /api/templates/:id
- Body: { updates }
- Response: { message: string }

DELETE /api/templates/:id
- Response: { message: string }
```

### Template Preview
```
POST /api/templates/preview
- Body: { htmlContent, cssStyles, sampleData }
- Response: { previewHtml: string }
```

### Template Versions
```
GET /api/templates/:id/versions
- Response: { versions: array }

POST /api/templates/:id/versions
- Body: { htmlContent, cssStyles, changes }
- Response: { versionId: number }
```

## Template Rendering Process

### Content Population
```javascript
const renderTemplate = (template, data) => {
    let html = template.html_content;
    let css = template.css_styles;

    // Replace placeholders in HTML
    Object.keys(data).forEach(key => {
        const placeholder = `{{${key}}}`;
        const value = data[key];
        html = html.replace(new RegExp(placeholder, 'g'), value);
        css = css.replace(new RegExp(placeholder, 'g'), value);
    });

    // Inject CSS
    html = html.replace('{{css_styles}}', css);

    return html;
};
```

### PDF Generation
1. **HTML Rendering**: Populate template with data
2. **CSS Application**: Apply styles for PDF compatibility
3. **Puppeteer Processing**: Convert HTML to PDF
4. **Asset Loading**: Ensure images and fonts load correctly

## Template Categories

### Certificate Types
- **Bonafide Certificate**: Course completion verification
- **Conduct Certificate**: Character/behavior certificate
- **Scholarship Certificate**: Financial aid verification
- **Achievement Certificate**: Awards and recognition
- **Custom Certificates**: Institution-specific certificates

### Template Features
- **Responsive Design**: Print-friendly layouts
- **Multi-language Support**: Unicode character support
- **Accessibility**: Screen reader compatible
- **Brand Consistency**: Institution branding guidelines

## Asset Management

### Image Assets
- **Logos**: Institution logos and seals
- **Signatures**: Digital signature images
- **Backgrounds**: Certificate background images
- **Icons**: QR codes and decorative elements

### File Organization
```
public/assets/
├── logos/
│   ├── institution_logo.png
│   └── department_logos/
├── signatures/
│   ├── director_signature.png
│   ├── principal_signature.png
│   └── hod_signatures/
├── seals/
│   └── institution_seal.png
└── backgrounds/
    └── certificate_bg.jpg
```

## Validation and Testing

### Template Validation
- **HTML Validation**: Well-formed HTML structure
- **CSS Validation**: Valid CSS syntax
- **Placeholder Check**: All required placeholders present
- **Asset Verification**: Image URLs accessible

### Preview System
- **Live Preview**: Real-time template rendering
- **Sample Data**: Test data for placeholder replacement
- **Print Preview**: PDF output simulation
- **Mobile Preview**: Responsive design testing

## Security Considerations

### Content Security
- **XSS Prevention**: Sanitize user inputs
- **Asset Validation**: Verify image sources
- **Template Injection**: Prevent malicious template code
- **Access Control**: Admin-only template editing

### Data Protection
- **Placeholder Sanitization**: Clean dynamic content
- **File Upload Security**: Validate uploaded assets
- **Template Permissions**: Role-based access control

## Performance Optimization

### Caching
- **Template Caching**: Cache compiled templates
- **Asset Caching**: Cache images and resources
- **Preview Caching**: Cache preview generations

### Optimization Techniques
- **Minification**: Compress HTML/CSS output
- **Lazy Loading**: Load assets on demand
- **CDN Integration**: External asset hosting

## Error Handling

### Template Errors
- **Missing Placeholders**: Validation warnings
- **Invalid HTML**: Syntax error reporting
- **Asset Loading**: Fallback handling
- **Rendering Failures**: Error logging and recovery

### User Feedback
- **Validation Messages**: Clear error descriptions
- **Preview Issues**: Debugging information
- **Save Conflicts**: Version conflict resolution

## Integration Points

### Certificate Generation
- **Template Selection**: Choose appropriate template
- **Data Mapping**: Map user data to placeholders
- **PDF Creation**: Generate final certificate

### Admin Interface
- **Template Editor**: WYSIWYG or code editor
- **Asset Manager**: Upload and organize images
- **Version Control**: Track template changes

### User Experience
- **Template Gallery**: Preview available templates
- **Customization**: Limited user customization options
- **Request Types**: Template selection for requests

## Testing

### Unit Tests
- Template rendering logic
- Placeholder replacement
- Validation functions
- Error handling

### Integration Tests
- Full certificate generation workflow
- Template CRUD operations
- Asset management
- PDF output quality

### User Acceptance Tests
- Template appearance
- Print quality
- QR code positioning
- Content accuracy

## Template Management System

### Complete Feature Overview
A production-ready certificate template management system with professional UI and comprehensive functionality for managing certificate designs.

#### Core Features
- **Upload Management**: Modal forms with file validation (JPG/PNG, 5MB max)
- **Template Storage**: Organized file system with preview thumbnails
- **Professional UI**: Responsive design matching admin dashboard theme
- **CRUD Operations**: Create, view, edit, delete templates with confirmation dialogs
- **Preview System**: Full modal preview with placeholder content
- **Security**: Authentication required, input sanitization, file type validation

#### Frontend Components

##### CertificateTemplates.jsx (380+ lines)
- Complete React component with state management
- Modal forms for upload and preview functionality
- Professional table display with action buttons
- File validation and error handling
- Responsive design for all screen sizes

##### UI Components Structure
```
┌─────────────────────────────────────────────────┐
│  📋 Certificate Templates    ✚ Upload New      │
│                                 Template       │
└─────────────────────────────────────────────────┘

┌──────┬──────────────┬─────────┬──────────┬──────────┬─────────────┐
│ S.No │ Cert Type    │ Preview │ Filename │ Updated  │ Actions     │
├──────┼──────────────┼─────────┼──────────┼──────────┼─────────────┤
│ 1    │ Completion   │ 🖼️      │ cert_1   │ Dec 2    │ 👁️ ✏️ 🗑️  │
│ 2    │ Excellence   │ 🖼️      │ cert_2   │ Dec 1    │ 👁️ ✏️ 🗑️  │
└──────┴──────────────┴──────────┴──────────┴──────────┴─────────────┘
```

##### Upload Modal Interface
```
┌─────────────────────────────────────────────────┐
│  📤 Upload New Template              X          │
├─────────────────────────────────────────────────┤
│  Certificate Type *                             │
│  [Dropdown: Completion ▼]                      │
│                                                 │
│  Background Image (JPG/PNG) *                  │
│  [Choose File...]                              │
│                                                 │
│  Upload Logo Image (Optional)                  │
│  [Choose File...]                              │
│                                                 │
│  HOD Signature (Optional)                      │
│  [Choose File...]                              │
│                                                 │
│  Principal Signature (Optional)                │
│  [Choose File...]                              │
├─────────────────────────────────────────────────┤
│                          [Cancel]  [💾 Save]   │
└─────────────────────────────────────────────────┘
```

##### Preview Modal
```
┌─────────────────────────────────────────────────┐
│  📄 Certificate Preview - Completion  X         │
├─────────────────────────────────────────────────┤
│                                                 │
│              [Template Background Image]       │
│                                                 │
│              John Doe (placeholder)            │
│              December 2, 2025 (placeholder)    │
│                                                 │
├─────────────────────────────────────────────────┤
│                            [Close]              │
└─────────────────────────────────────────────────┘
```

#### Backend Implementation

##### API Endpoints Structure
```
GET    /api/templates/          # List all templates
POST   /api/templates/upload    # Create new template
GET    /api/templates/:id       # Fetch specific template
PUT    /api/templates/:id       # Update template
DELETE /api/templates/:id       # Delete template
```

##### File Organization
```
public/templates/
├── backgrounds/     # Certificate background images
├── logos/          # Institution logos
├── signatures/     # HOD and Principal signatures
└── thumbnails/     # Preview images
```

#### Security & Validation

##### File Security
- **Type Validation**: JPG/PNG only (client and server-side)
- **Size Limits**: 5MB maximum per file
- **Path Security**: Sanitized file paths and names
- **Access Control**: Authentication required for all operations

##### Input Validation
- **Form Validation**: Required fields and format checking
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Token-based requests

#### Performance Metrics

##### Code Quality
- **Bundle Size Impact**: ~15KB (minified React component)
- **CSS Additions**: ~360 lines (well-organized, responsive)
- **Database Optimization**: Indexed queries for fast retrieval
- **File Upload Speed**: Browser-limited (5MB max)
- **Page Load Time**: No impact (lazy-loaded component)

##### Responsive Design
- **Desktop**: 1920px+ optimized layout
- **Tablet**: 768px-1024px responsive tables
- **Mobile**: 320px-767px touch-friendly interface

#### Integration Workflow

```
1. Database Setup (certificate_templates table)
   ↓
2. File System (create /public/templates directories)
   ↓
3. Backend Controller (templateController.js implementation)
   ↓
4. Route Registration (connect API endpoints)
   ↓
5. Frontend Integration (add to AdminDash.jsx)
   ↓
6. Testing (upload/preview/delete flows)
   ↓
7. Production Deployment
```

#### Future Development Phases

##### Phase 2 (Easy Additions)
- Template preview with real certificate data
- Template duplication feature
- Batch template upload
- Template search and filtering

##### Phase 3 (Medium Complexity)
- In-app image editor for templates
- Template versioning system
- Template sharing between institutions
- Template usage analytics

##### Phase 4 (Advanced Features)
- AI-powered template suggestions
- Dynamic QR code positioning
- Multi-language template support
- Template marketplace integration

## Future Enhancements

### Advanced Features
- **Drag-and-Drop Editor**: Visual template builder
- **Template Marketplace**: Shared template library
- **Dynamic Layouts**: Responsive certificate designs
- **Multi-page Certificates**: Complex certificate formats

### Integration
- **Third-party Editors**: Integration with design tools
- **Version Control Systems**: Git-based template management
- **API Access**: Template management APIs
- **Bulk Operations**: Mass template updates

### Analytics
- **Usage Statistics**: Template popularity tracking
- **Performance Metrics**: Rendering time analysis
- **Error Tracking**: Template failure monitoring
- **User Feedback**: Template rating system
