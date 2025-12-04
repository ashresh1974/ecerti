# Certificate Templates Management System - Implementation Guide

## 📋 Overview
This guide covers the Certificate Templates Management feature added to the admin dashboard. It allows admins to upload, preview, edit, and delete certificate templates with custom backgrounds, logos, and signatures.

---

## 📂 Files Created/Modified

### Frontend Files

#### 1. **CertificateTemplates.jsx** (NEW)

**Location:** `frontend/src/admindashboard/CertificateTemplates.jsx`

- Complete component for managing certificate templates
- Features:
  - Display all templates in a professional table
  - Upload new templates via modal form
  - Preview templates with placeholder text
  - Edit and delete functionality (edit is placeholder for future dev)
  - File validation (JPG/PNG only, max 5MB)

#### 2. **AdminDash.jsx** (MODIFIED)

**Location:** `frontend/src/admindashboard/AdminDash.jsx`

- Added import: `import CertificateTemplates from "./CertificateTemplates";`
- Added menu item: `"Certificate Templates"` to MENU_ITEMS array
- Added URL detection: `location.pathname.includes('templates')`
- Added render condition: `{activeMenu === "Certificate Templates" && <CertificateTemplates />}`

#### 3. **AdminDash.css** (ENHANCED)

**Location:** `frontend/src/admindashboard/AdminDash.css`

- Added comprehensive styles for:
  - Templates header with gradient
  - Table styling (thead, tbody, rows, cells)
  - Button styles (Upload, Preview, Edit, Delete, Save, Cancel)
  - Modal overlay and content
  - Form groups and inputs
  - File upload styling
  - Certificate preview container
  - Responsive animations and hover effects

---

### Backend Files

#### 1. **templates.js** (NEW)
**Location:** `backend/src/routes/templates.js`
- API route skeleton with placeholders
- Routes implemented:
  - `GET /api/templates/` - List all templates
  - `POST /api/templates/upload` - Upload new template
  - `GET /api/templates/:templateId` - Get template by ID
  - `PUT /api/templates/:templateId` - Update template
  - `DELETE /api/templates/:templateId` - Delete template

#### 2. **server.js** (TO BE MODIFIED)
**Location:** `backend/src/server.js`
Add this line after other route imports:
```javascript
const templatesRoutes = require('./routes/templates');
app.use('/api/templates', isAuthenticated, templatesRoutes);
```

---

## 🗄️ MySQL Database Schema

Create the `certificate_templates` table with this SQL:

```sql
CREATE TABLE IF NOT EXISTS certificate_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  certificateType VARCHAR(100) NOT NULL UNIQUE,
  backgroundImagePath VARCHAR(255),
  logoImagePath VARCHAR(255),
  hodSignaturePath VARCHAR(255),
  principalSignaturePath VARCHAR(255),
  fileName VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdBy INT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  INDEX idx_certificateType (certificateType),
  INDEX idx_status (status),
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
);
```

---

## 🚀 Implementation Steps

### Step 1: Register Template Routes in Backend
Edit `backend/src/server.js`:
```javascript
// After other route imports, add:
const templatesRoutes = require('./routes/templates');

// After other route middleware, add:
app.use('/api/templates', isAuthenticated, templatesRoutes);

// Ensure static file serving for templates folder exists:
app.use('/templates', express.static(path.join(__dirname, '../public/templates')));
```

### Step 2: Create Public Folder for Templates
```bash
mkdir -p backend/public/templates
```

### Step 3: Create Template Controller (Optional Enhancement)
Future: Create `backend/src/controllers/templateController.js` to handle:
- File uploads using `multer`
- Database CRUD operations
- Image validation and storage
- File cleanup on deletion

### Step 4: Test the Frontend
```bash
cd frontend
npm start
```
Navigate to Admin Dashboard → Certificate Templates

### Step 5: Connect Backend API
Implement the controller functions as per the route placeholders in `templates.js`.

---

## 🎨 UI/UX Features

### Dashboard Layout
- **Header**: Gradient background with title and "Upload New Template" button
- **Table**: Professional design with:
  - Template preview thumbnails
  - Last updated date
  - Action buttons (Preview, Edit, Delete)
  - Responsive design
  - Hover effects

### Upload Modal
- Form with fields:
  - Certificate Type (dropdown)
  - Background Image (required, JPG/PNG, max 5MB)
  - Logo Image (optional)
  - HOD Signature (optional)
  - Principal Signature (optional)
- File validation on client-side
- Progress indication during upload
- Success/Error alerts

### Preview Modal
- Full-screen modal display of template
- Shows background image
- Placeholder text for student name and date
- Logo overlay if available
- Lightweight and responsive

---

## 🔗 API Integration Points

### GET /api/templates/
Fetch all certificate templates
```javascript
// Expected Response:
[
  {
    id: 1,
    certificateType: "Completion",
    backgroundImagePath: "templates/cert_1.jpg",
    logoImagePath: "templates/logo_1.png",
    hodSignaturePath: "templates/hod_1.png",
    principalSignaturePath: "templates/principal_1.png",
    fileName: "Completion_Certificate",
    lastUpdated: "2025-12-02T10:30:00Z"
  }
]
```

### POST /api/templates/upload
Upload new template with multipart form-data
```javascript
// Form Fields:
- certificateType: string (required)
- backgroundImage: File (required, JPG/PNG)
- logoImage: File (optional)
- hodSignature: File (optional)
- principalSignature: File (optional)

// Expected Response:
{
  message: "Template uploaded successfully",
  templateId: 1,
  certificateType: "Completion"
}
```

### DELETE /api/templates/:templateId
Delete a template
```javascript
// Expected Response:
{
  message: "Template deleted successfully",
  templateId: 1
}
```

---

## 🎯 Future Enhancements

1. **Edit Functionality**
   - Implement PUT endpoint to update templates
   - Allow changing certificate type, images, etc.

2. **Template Versioning**
   - Track template changes
   - Ability to revert to previous versions

3. **Template Preview Enhancement**
   - Render actual certificate with sample data
   - Add text positioning editor

4. **Image Editor**
   - Built-in image cropping tool
   - Drag-and-drop positioning for logos/signatures

5. **Template Sharing**
   - Share templates between institutions
   - Template marketplace

6. **Audit Logging**
   - Track who created/modified/deleted templates
   - Timestamp all actions

---

## 🧪 Testing Checklist

- [ ] Upload button opens modal
- [ ] Form validation works (required fields)
- [ ] File type validation works (JPG/PNG only)
- [ ] File size validation works (max 5MB)
- [ ] Preview modal displays correctly
- [ ] Delete confirmation modal appears
- [ ] Table updates after upload/delete
- [ ] Responsive design on mobile/tablet
- [ ] Error handling for failed uploads
- [ ] Proper file cleanup on delete

---

## 📝 Notes

- All file uploads are validated on the client-side for UX
- Backend should re-validate file types and sizes for security
- Images are served statically from `/public/templates/` directory
- Template IDs are used to associate certificates with templates (future enhancement)
- Admin dashboard maintains consistent styling with existing pages

---

## ⚠️ Important Reminders

1. **DO NOT** modify existing authentication, routing, or DB models
2. **DO NOT** break any existing functionality
3. **Verify** that the new routes don't conflict with existing routes
4. **Test** the feature thoroughly before deploying to production
5. **Backup** the database before running migration

---

## 📞 Support

For questions or issues during implementation, refer to:
- React documentation: https://react.dev/
- Axios documentation: https://axios-http.com/
- Express.js documentation: https://expressjs.com/
- MySQL documentation: https://dev.mysql.com/doc/

