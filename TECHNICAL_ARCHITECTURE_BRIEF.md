# eCerti Technical Architecture Brief

## Overview
eCerti is a full-stack e-Certificate Management System with:
- **Frontend**: React (single-page app with multiple dashboards)
- **Backend**: Node.js + Express (REST API with business logic)
- **Database**: MySQL (certificates, users, templates, QR logs)
- **Auth**: Session-based with OTP verification
- **PDF Generation**: Certificate PDFs with QR codes, QR verification tracking

---

## FRONTEND STRUCTURE & COMPONENTS

### 1. **Routing Architecture** (`frontend/src/index.jsx`)

The application uses React Router with three main route categories:

#### **Public Routes** (No authentication required)
```
/login                          → Login page
/register                       → Registration flow
/forgotpassword                → Password recovery
/verify/:reference_num         → Public certificate verification (via QR code)
/certificate-view/:reference_num → Public PDF viewer
```

#### **Student Protected Routes** (`/studentdashboard`)
Wrapped in `ProtectedRouteStudent` component - accessible only with student role
```
/studentdashboard              → Student profile (default)
/studentdashboard/apply-certificate        → Apply for certificate
/studentdashboard/certificate-status       → View application status
/studentdashboard/download-certificates    → Download verified certificates
/studentdashboard/change-password          → Change password
```

#### **Admin Protected Routes** (`/admin/*`)
Wrapped in `ProtectedRouteAdmin` component - accessible only with admin role
```
/admin                         → Dashboard (home)
/admin/certificate-requests    → Pending certificate approvals
/admin/issued-certificates    → View all verified certificates
/admin/student-management     → Manage student records
/admin/student-details/:id    → Individual student details
/admin/request/:reference_num → Certificate request details
/admin/change-password        → Change admin password
```

### 2. **Route Protection Components**

#### **ProtectedRoute.jsx** (Base protection)
```javascript
- Checks if user session exists (req.session.user)
- Redirects to /login if not authenticated
- Prevents access to protected pages without login
```

#### **ProtectedRouteStudent.jsx** (Student-specific)
```javascript
- Verifies user role === 'student'
- Blocks access if user is admin or not authenticated
- Redirects unauthorized access to /login
```

#### **ProtectedRouteAdmin.jsx** (Admin-specific)
```javascript
- Verifies user role === 'admin'
- Blocks access if user is student or not authenticated
- Redirects unauthorized access to /login
```

### 3. **Key Frontend Pages & Components**

| Component | Path | Purpose | Role |
|-----------|------|---------|------|
| **Login** | `login/Login.jsx` | User authentication with email/password | Public |
| **Register** | `register/Register.jsx` | User registration flow | Public |
| **ForgotPassword** | `forgotpassword/ForgotPass.jsx` | Password recovery via OTP | Public |
| **AdminDash** | `admindashboard/AdminDash.jsx` | Main admin dashboard (requests, issues, students) | Admin |
| **StudDash** | `studentdashboard/StudDash.jsx` | Student dashboard with nested routes | Student |
| **ApplyCertificate** | `studentdashboard/ApplyCertificate.jsx` | Apply for certificates (Bonafide/Conduct/Scholar) | Student |
| **CertificateStatus** | `studentdashboard/CertificateStatus.jsx` | Track application status (pending/approved/rejected) | Student |
| **DownloadCertificates** | `studentdashboard/DownloadCertificates.jsx` | Download approved PDFs | Student |
| **VerifyCertificate** | `pages/VerifyCertificate.jsx` | Public verification page for QR codes | Public |
| **StudentProfile** | `studentdashboard/StudentProfile.jsx` | View/edit student profile | Student |

### 4. **Frontend Communication Pattern**

```
React Component
    ↓ (axios with credentials)
Express Server (backend/src/server.js)
    ↓ (CORS enabled for http://localhost:3000)
Database Query via certificateController
    ↓
MySQL Database
```

**Key Configuration**: `axios.defaults.withCredentials = true` enables cookie-based session management across requests.

---

## BACKEND STRUCTURE & API INTEGRATION

### 1. **Server Setup** (`backend/src/server.js`)

#### **Middleware Stack**
```javascript
1. dotenv config        → Load environment variables
2. express.json()       → Parse JSON payloads
3. CORS middleware      → Allow frontend origins (localhost:3000, 3001, 10.55.47.47:3000)
4. express-session      → Session management
5. Request logger       → Log POST/PUT requests for debugging
```

#### **Static File Serving**
```
/certificates  → POST certificate PDFs (generated on approval)
/templates     → HTML certificate templates for generation
/qr-codes      → Generated QR code PNG files
/assets        → Logo, signatures (dual source: backend + frontend fallback)
```

#### **Public Endpoints** (No authentication)
```javascript
GET /api/certificate/public/details/:reference_num
GET /api/certificate/verify/:reference_num
GET /verify (redirect to VerifyCertificate page)
```

### 2. **Database Connection** (`backend/src/config/db.js`)

```javascript
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

// Promisify queries for async/await usage
db.query = util.promisify(db.query);
```

**Connection Flow**:
1. Load `.env` file with DB credentials
2. Create MySQL connection
3. Convert callback-based queries to Promises
4. Exported for use in controllers

---

## CERTIFICATE CONTROLLER LOGIC & DATABASE INTEGRATION

### 1. **Certificate Application Flow** (`certificateController.applyCertificate`)

**Endpoint**: `POST /api/certificate/apply`
**Role**: Student
**Request Body**:
```json
{
  "certificate_type": "Bonafide Certificate",
  "full_name": "Student Name",
  "parent_name": "Parent Name",
  "roll_number": "12345",
  "course": "B.Tech",
  "branch": "CSE",
  "duration": "4 years",
  "present_year": 3,
  "remark": "Application remark"
}
```

**Processing Logic**:
1. **Validation**: Conduct Certificate only for 4th-year students
2. **Duplicate Check**: Prevent multiple applications for same certificate type in same calendar year
3. **Gender Retrieval**: Fetch from users table for PDF generation
4. **ID Generation**:
   ```
   serial_num = "CERT/2025/12345" (format: CERT/YEAR/RANDOM)
   reference_num = "4511" + "2025" + "123456" (14-digit ID)
   qr_code = SHA256(serial_num + full_name + roll_number + certificate_type)
   ```
5. **Database Insert**:
   ```sql
   INSERT INTO certificates (
     serial_num, reference_num, certificate_type, full_name,
     parent_name, roll_number, course, branch, duration,
     present_year, qr_code, remark
   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
   ```
6. **Status**: Set to 'pending' by default
7. **Response**: Returns `{ message: "...", serial_num: "CERT/2025/12345" }`

### 2. **Certificate Approval & PDF Generation** (`certificateController.approveCertificate`)

**Endpoint**: `POST /api/certificate/approve/:reference_num`
**Role**: Admin
**Request Body**: `{ template_id: 1 }` (optional)

**Processing Steps**:

#### **Step 1: Update Certificate Status**
```sql
UPDATE certificates 
SET status = 'verified', issued_date = NOW(), template_id = ?
WHERE reference_num = ?
```

#### **Step 2: PDF Generation** (`generateCertificatePDF`)

**QR Code Creation**:
```javascript
const verifyUrl = `${FRONTEND_URL}/verify/${reference_num}`;
const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
  errorCorrectionLevel: 'H',  // High error correction
  type: 'image/png',
  margin: 2,
  width: 300
});
```
- Creates scannable QR code pointing to `/verify/:reference_num`
- Embedded as base64 data URI in PDF
- Saved as PNG file to `/qr-codes/`

**HTML Template Processing**:
```javascript
// Template selection based on certificate type
if (type.includes('conduct'))   → 'conduct-certificate.html'
if (type.includes('scholar'))   → 'schoarship-bonafide-certificate.html'
else                             → 'bonafide-certificate.html'
```

**Template Placeholder Replacements** (in HTML):
```
{{SERIAL_NUM}} → Certificate serial number
{{STUDENT_NAME}} → Mr./Ms. + Full name
{{PARENT_NAME}} → Parent/Guardian name
{{SO_DO}} → "S/o" (male) or "D/o" (female)
{{HE_SHE}} → "He" or "She"
{{HIS_HER}} → "His" or "Her"
{{ROLL_NO}} → Student roll number
{{BRANCH}} → Branch of study
{{COURSE}} → Course name
{{ACADEMIC_YEAR}} → Duration (e.g., 4 years)
{{ISSUED_DATE}} → Issue date (formatted)
{{QR_CODE_BASE64}} → Base64 QR code image
{{REFERENCE_NUM}} → Reference number
/assets/MGU_LOGO.png → Logo embedded as base64
```

**PDF Generation Methods** (fallback chain):
1. **Puppeteer** (preferred): Headless Chrome rendering for best fidelity
   ```javascript
   const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
   await page.pdf({ path, format: 'A4', printBackground: true });
   ```

2. **html-pdf** (fallback): If Puppeteer unavailable
   ```javascript
   htmlPdf.create(htmlContent, options).toFile(filePath);
   ```

#### **Step 3: Database Updates**
```sql
UPDATE certificates 
SET pdf_path = 'reference_num.pdf'
WHERE reference_num = ?
```

#### **Step 4: Email Notification**
```javascript
// Send approval email to student
const subject = 'Certificate Approved - Download Now';
const htmlContent = `
  <p>Your ${certificate_type} has been approved.</p>
  <p><a href="http://10.55.47.47:3000/login">Download Certificate</a></p>
`;
await transporter.sendMail({ from, to, subject, html });
```

### 3. **Certificate Verification** (`certificateController.verifyCertificate`)

**Endpoint**: `GET /api/certificate/verify/:reference_num`
**Role**: Public (no authentication)

**Verification Logic**:
```javascript
// Query
SELECT * FROM certificates 
WHERE reference_num = ? AND status = 'verified'

// If found:
1. Log verification to qr_verification_logs (IP, user-agent)
2. Return certificate data (name, roll_no, type, issue_date, etc.)
3. Set verified = true

// If not found or status ≠ 'verified':
Return { verified: false, message: "Certificate not found" }
```

**Audit Trail** (stored in DB):
```sql
INSERT INTO qr_verification_logs (reference_num, user_agent, ip_address)
VALUES (?, ?, ?)
```

### 4. **Download Certificate** (`certificateController.downloadCertificate`)

**Endpoint**: `GET /api/certificate/download/:reference_num`
**Role**: Authenticated student/admin

**Flow**:
```
1. Query certificates table for pdf_path
2. Construct file path: /backend/public/certificates/{pdf_path}
3. Check if file exists on disk
4. Set headers: Content-Type: application/pdf
5. Send file inline (displays in browser vs download)
```

### 5. **Other Certificate Operations**

| Operation | Method | Role | Database Action |
|-----------|--------|------|-----------------|
| **Reject** | POST /reject/:ref_num | Admin | SET status='rejected', remark=? |
| **Re-apply** | POST /reapply/:ref_num | Student | SET status='pending', update fields |
| **Get Stats** | GET /stats | Admin | COUNT by status |
| **Recent** | GET /recent | Admin | ORDER BY requested_date DESC LIMIT 10 |
| **Student Certs** | GET /student | Student | SELECT where roll_number = session.user.roll_number |

---

## DATABASE SCHEMA (Key Tables)

### **Certificates Table**
```sql
CREATE TABLE certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  serial_num VARCHAR(50) UNIQUE,              -- CERT/2025/12345
  reference_num VARCHAR(20) UNIQUE NOT NULL,  -- 14-digit (45112025123456)
  certificate_type VARCHAR(50),               -- 'Bonafide' / 'Conduct' / 'Scholar'
  full_name VARCHAR(100),
  parent_name VARCHAR(100),
  roll_number VARCHAR(20),
  course VARCHAR(50),
  branch VARCHAR(50),
  duration VARCHAR(20),
  present_year INT,
  qr_code VARCHAR(255),                       -- SHA256 hash
  pdf_path VARCHAR(255),                      -- 'reference_num.pdf'
  status ENUM('pending', 'verified', 'rejected'),
  requested_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  issued_date DATETIME,
  remark TEXT,
  template_id INT,
  FOREIGN KEY (roll_number) REFERENCES users(roll_number)
);
```

### **QR Verification Logs Table**
```sql
CREATE TABLE qr_verification_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reference_num VARCHAR(20),
  user_agent TEXT,
  ip_address VARCHAR(45),
  verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reference_num) REFERENCES certificates(reference_num)
);
```

---

## DATA FLOW DIAGRAM

### **Certificate Application Flow**
```
Student Frontend (ApplyCertificate.jsx)
    ↓ POST /api/certificate/apply {form data}
Backend (certificateController.applyCertificate)
    ↓ Validate + Generate IDs
MySQL (INSERT INTO certificates)
    ↓ Row created with status='pending'
Response → Frontend (success message + serial_num)
```

### **Approval & PDF Generation Flow**
```
Admin Frontend (RequestDetails.jsx - approve button)
    ↓ POST /api/certificate/approve/:ref_num
certificateController.approveCertificate
    ↓ Update status = 'verified'
    ↓ Fetch certificate data
generateCertificatePDF
    ↓ 1. Generate QR code (verifyUrl → base64)
    ↓ 2. Load HTML template
    ↓ 3. Replace {{placeholders}}
    ↓ 4. Render with Puppeteer/html-pdf
    ↓ 5. Save to /backend/public/certificates/
    ↓ 6. Update pdf_path in DB
    ↓ 7. Send approval email (nodemailer)
Response → Admin (PDF generated, email sent)
```

### **Verification Flow (Public)**
```
Third Party / Student
    ↓ Scan QR code on certificate PDF
    ↓ Redirects to /verify/:reference_num
Frontend (VerifyCertificate.jsx)
    ↓ Calls GET /api/certificate/verify/:ref_num
Backend (certificateController.verifyCertificate)
    ↓ 1. Query DB for certificate with status='verified'
    ↓ 2. Log verification (qr_verification_logs)
    ↓ 3. Return certificate data
Frontend
    ↓ Display verified certificate details
    ↓ Show success/failure status
```

---

## API Endpoints Summary

### **Authentication** (`/api` routes via `auth.js`)
```
POST   /register                      → Register new user
POST   /register/send-otp            → Send OTP for verification
POST   /register/verify-otp          → Verify registration OTP
POST   /login                        → Login with email/password
POST   /forgot-password/send-otp     → Send password reset OTP
POST   /forgot-password/verify-otp   → Verify password OTP
POST   /forgot-password/reset-password → Reset password
POST   /logout                       → Destroy session
GET    /me                          → Validate current session
```

### **Certificate Management** (`/api/certificate` routes)
```
POST   /apply                       → Student applies for certificate
GET    /stats                       → Admin: Get dashboard statistics
GET    /recent                      → Admin: Recent 10 certificates
GET    /issued                      → Admin: Verified certificates only
GET    /details/:ref_num            → Get certificate details
GET    /verify/:ref_num             → PUBLIC: Verify via QR (no auth)
POST   /approve/:ref_num            → Admin: Approve + Generate PDF
POST   /reject/:ref_num             → Admin: Reject with reason
POST   /reapply/:ref_num            → Student: Resubmit after rejection
GET    /student                     → Student: Get own certificates
POST   /generate/:ref_num           → Generate/regenerate PDF
GET    /download/:ref_num           → Download PDF file
GET    /qr-logs                     → Admin: QR verification audit trail
```

### **Public Endpoints** (No auth required)
```
GET    /api/certificate/public/details/:ref_num → Certificate details (public view)
GET    /api/certificate/verify/:ref_num         → QR verification
```

---

## Key Integration Points

### **1. Session Management**
- Express-session stores user data in memory (for dev)
- Production should use Redis persistent store
- Cookie includes `session_id` for client-server tracking
- `isAuthenticated` middleware checks `req.session.user` on protected routes

### **2. Email Integration** (nodemailer)
- Configured via `backend/src/config/mailer` (not shown but used in controller)
- Sends on: approval, rejection, registration, password reset
- HTML templates with dynamic links

### **3. File Upload & Storage**
- Multer middleware (configured in routes) handles file uploads
- Certificates saved to `/backend/public/certificates/`
- QR codes saved to `/backend/public/qr-codes/`
- Assets (logos, signatures) served from `/backend/public/assets/`

### **4. QR Code Implementation**
- Generated as URL: `${FRONTEND_URL}/verify/:reference_num`
- Encoded in PDF as base64 image
- Scanned QR → Opens verification page → Calls verify API → Shows certificate details
- Verification logged for audit trail

### **5. Gender-Based Pronouns**
- Female: "She", "Her", "D/o" (Daughter of)
- Male: "He", "His", "S/o" (Son of)
- Fetched from users table, used in PDF templates

---

## Error Handling & Validation

| Scenario | Status | Response |
|----------|--------|----------|
| Conduct cert, not 4th year | 400 | "Only available for 4th year students" |
| Duplicate application in year | 400 | "Already applied for this certificate in current year" |
| Certificate not found | 404 | "Certificate not found" |
| PDF generation failed | 500 | "Error generating certificate" |
| DB connection error | 500 | Error message with SQL details |
| Unauthorized access | 401 | "Unauthorized: Session expired" |
| Invalid QR verification | 404 | "Certificate not found or not verified" |

---

## Production Deployment Checklist

- [ ] Replace memory session store with Redis
- [ ] Set `cookie.secure = true` (HTTPS only)
- [ ] Set `sameSite = 'Strict'` for security
- [ ] Configure CORS to production origins only
- [ ] Set `NODE_ENV = 'production'`
- [ ] Enable helmet.js for security headers
- [ ] Add rate limiting middleware
- [ ] Configure persistent file storage (S3 or CDN for PDFs)
- [ ] Set up certificate backup/archival process
- [ ] Configure email SMTP for production
- [ ] Enable HTTPS/SSL
- [ ] Add monitoring and logging (Winston/Morgan)
- [ ] Set up database backups

---

## Summary

**eCerti Architecture**:
1. **Frontend**: Multi-role SPA (Public, Student, Admin) using React Router
2. **Backend**: Express REST API with session-based authentication
3. **Certificates**: Generated on-demand with QR codes embedded
4. **Database**: MySQL with audit trails (QR verification logs)
5. **Notifications**: Email on approval/rejection
6. **Verification**: Public QR verification without authentication
7. **Scaling Ready**: Designed for persistent session stores and cloud deployments

