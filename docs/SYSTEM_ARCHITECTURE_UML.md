# eCerti System Architecture & UML Diagrams

## System Overview

The eCerti system is a comprehensive digital certificate management platform built with a modern web architecture. It provides secure certificate generation, QR code verification, and complete administrative control for educational institutions.

### Technology Stack

- **Frontend**: React.js with React Router
- **Backend**: Node.js with Express.js
- **Database**: MySQL with connection pooling
- **Authentication**: Session-based with OTP verification
- **Email Service**: Nodemailer with SMTP
- **File Processing**: PDF generation with Puppeteer
- **Security**: AES-256-CBC encryption for OTPs

### System Components

- **User Interface Layer**: React components for admin and student dashboards
- **API Layer**: RESTful endpoints for all business operations
- **Business Logic Layer**: Controllers handling certificate generation, user management
- **Data Access Layer**: MySQL database with optimized queries
- **Infrastructure Layer**: File storage, email service, session management

---

## Class Diagram

```mermaid
classDiagram
    %% Core Entities
    class User {
        +id: int
        +username: varchar
        +email: varchar
        +password: varchar (hashed)
        +role: enum (0=student, 1=admin)
        +full_name: varchar
        +roll_number: varchar
        +course: varchar
        +branch: varchar
        +created_at: timestamp
        +updated_at: timestamp
        +registerUser()
        +loginUser()
        +changePassword()
        +getProfile()
    }

    class Certificate {
        +id: int
        +reference_num: varchar (unique)
        +serial_num: varchar
        +full_name: varchar
        +roll_number: varchar
        +parent_name: varchar
        +gender: enum
        +certificate_type: varchar
        +course: varchar
        +branch: varchar
        +present_year: varchar
        +academic_year: varchar
        +issued_date: datetime
        +status: varchar
        +user_id: int
        +template_id: int
        +qr_code_path: varchar
        +verification_token: varchar
        +requestCertificate()
        +approveCertificate()
        +generatePDF()
        +generateQR()
        +verifyCertificate()
    }

    class CertificateTemplate {
        +id: int
        +name: varchar
        +type: varchar
        +description: text
        +html_content: longtext
        +css_styles: longtext
        +background_image: varchar
        +logo_path: varchar
        +hod_signature: varchar
        +principal_signature: varchar
        +is_active: boolean
        +created_by: int
        +created_at: timestamp
        +uploadTemplate()
        +renderTemplate()
        +updateTemplate()
        +deleteTemplate()
    }

    class QRVerificationLog {
        +id: int
        +certificate_id: int
        +reference_num: varchar
        +timestamp: datetime
        +ip_address: varchar
        +user_agent: text
        +is_valid: boolean
        +error_message: text
        +logVerification()
        +getVerificationHistory()
    }

    class OTPRecord {
        +id: int
        +email: varchar
        +otp_code: varchar (encrypted)
        +purpose: varchar
        +expires_at: datetime
        +is_used: boolean
        +created_at: timestamp
        +generateOTP()
        +verifyOTP()
        +expireOTP()
    }

    %% Controllers
    class AuthController {
        +registerUser(req, res)
        +loginUser(req, res)
        +logoutUser(req, res)
        +sendOTP(req, res)
        +verifyOTP(req, res)
        +resetPassword(req, res)
        +validateSession(req, res)
    }

    class CertificateController {
        +requestCertificate(req, res)
        +approveCertificate(req, res)
        +generateCertificate(req, res)
        +getCertificates(req, res)
        +downloadCertificate(req, res)
        +verifyCertificate(req, res)
        +getQRLogs(req, res)
    }

    class TemplateController {
        +uploadTemplate(req, res)
        +getTemplates(req, res)
        +updateTemplate(req, res)
        +deleteTemplate(req, res)
        +renderTemplate(req, res)
    }

    class UserController {
        +getUsers(req, res)
        +updateUser(req, res)
        +getUserProfile(req, res)
        +changePassword(req, res)
    }

    %% Services
    class EmailService {
        +sendOTP(email, otp)
        +sendCertificate(email, certificatePath)
        +sendNotification(email, subject, message)
    }

    class PDFService {
        +generatePDF(template, data)
        +addQRCode(pdf, qrPath)
        +savePDF(pdf, path)
    }

    class QRService {
        +generateQR(data, options)
        +saveQR(qr, path)
        +verifyQR(token)
    }

    class EncryptionService {
        +encryptOTP(otp)
        +decryptOTP(encryptedOTP)
        +hashPassword(password)
        +verifyPassword(password, hash)
    }

    %% Database Layer
    class DatabaseConnection {
        +connect()
        +disconnect()
        +query(sql, params)
        +transaction(callback)
    }

    %% Relationships
    User ||--o{ Certificate : requests
    User ||--o{ CertificateTemplate : creates
    Certificate ||--|| QRVerificationLog : generates
    Certificate ||--|| CertificateTemplate : uses
    CertificateController --> Certificate : manages
    CertificateController --> PDFService : uses
    CertificateController --> QRService : uses
    AuthController --> User : manages
    AuthController --> OTPRecord : manages
    AuthController --> EncryptionService : uses
    AuthController --> EmailService : uses
    TemplateController --> CertificateTemplate : manages
    UserController --> User : manages
    DatabaseConnection --> User : persists
    DatabaseConnection --> Certificate : persists
    DatabaseConnection --> CertificateTemplate : persists
    DatabaseConnection --> QRVerificationLog : persists
    DatabaseConnection --> OTPRecord : persists
```

---

## Use Case Diagram

```mermaid
graph TD
    %% Actors
    A[Student]:::student
    B[Administrator]:::admin
    C[Public User]:::public

    %% Student Use Cases
    A --> UC1[Register Account]
    A --> UC2[Login to System]
    A --> UC3[Request Certificate]
    A --> UC4[View Certificate Status]
    A --> UC5[Download Certificate]
    A --> UC6[Change Password]
    A --> UC7[View Profile]

    %% Administrator Use Cases
    B --> UC8[Login to Admin Panel]
    B --> UC9[Review Certificate Requests]
    B --> UC10[Approve/Reject Certificates]
    B --> UC11[Generate Certificates]
    B --> UC12[Manage Templates]
    B --> UC13[Manage Users]
    B --> UC14[View QR Verification Logs]
    B --> UC15[Change Password]

    %% Public User Use Cases
    C --> UC16[Scan QR Code]
    C --> UC17[Verify Certificate]

    %% System Use Cases
    UC1 --> SYS1[Send OTP Email]
    UC2 --> SYS2[Validate Credentials]
    UC3 --> SYS3[Store Certificate Request]
    UC4 --> SYS4[Check Request Status]
    UC5 --> SYS5[Generate PDF]
    UC6 --> SYS6[Update Password Hash]
    UC7 --> SYS7[Retrieve User Data]
    UC8 --> SYS8[Validate Admin Role]
    UC9 --> SYS9[Query Pending Requests]
    UC10 --> SYS10[Update Certificate Status]
    UC11 --> SYS11[Create PDF with QR]
    UC12 --> SYS12[Upload Template Files]
    UC13 --> SYS13[CRUD User Operations]
    UC14 --> SYS14[Query Verification Logs]
    UC15 --> SYS6
    UC16 --> SYS15[Decode QR URL]
    UC17 --> SYS16[Validate Certificate Data]

    %% System Boundaries
    SYS1 --> EMAIL[Email Service]
    SYS5 --> PDF[PDF Generator]
    SYS11 --> PDF
    SYS12 --> FILE[File Storage]
    SYS16 --> DB[(Database)]

    %% Styling
    classDef student fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef admin fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef public fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef system fill:#fff3e0,stroke:#e65100,stroke-width:2px
```

---

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Student
    participant Frontend
    participant Backend
    participant Database
    participant EmailService
    participant PDFGenerator
    participant FileStorage

    %% Registration Flow
    rect rgb(240, 248, 255)
        Student->>Frontend: Click Register
        Frontend->>Student: Show Registration Form
        Student->>Frontend: Enter Details + Submit
        Frontend->>Backend: POST /api/register/send-otp
        Backend->>Backend: Generate OTP
        Backend->>Backend: Encrypt OTP
        Backend->>Database: Store OTP Record
        Backend->>EmailService: Send OTP Email
        EmailService-->>Backend: Email Sent
        Backend-->>Frontend: OTP Sent Response
        Frontend-->>Student: Show OTP Input

        Student->>Frontend: Enter OTP
        Frontend->>Backend: POST /api/register/verify-otp
        Backend->>Database: Retrieve OTP Record
        Backend->>Backend: Decrypt & Verify OTP
        Backend->>Backend: Hash Password
        Backend->>Database: Create User Account
        Backend-->>Frontend: Registration Success
        Frontend-->>Student: Show Success Message
    end

    %% Certificate Request Flow
    rect rgb(255, 248, 220)
        Student->>Frontend: Login & Navigate to Dashboard
        Frontend->>Backend: GET /api/me (validate session)
        Backend-->>Frontend: User Data
        Student->>Frontend: Click "Apply Certificate"
        Frontend->>Student: Show Certificate Form
        Student->>Frontend: Fill Details + Submit
        Frontend->>Backend: POST /api/certificates/request
        Backend->>Database: Insert Certificate Request
        Backend-->>Frontend: Request Submitted
        Frontend-->>Student: Show Confirmation
    end

    %% Certificate Approval Flow
    rect rgb(240, 255, 240)
        Administrator->>Frontend: Login to Admin Panel
        Frontend->>Backend: POST /api/login
        Backend->>Database: Validate Admin Credentials
        Backend-->>Frontend: Admin Session Created

        Administrator->>Frontend: View Certificate Requests
        Frontend->>Backend: GET /api/certificates/pending
        Backend->>Database: Query Pending Certificates
        Database-->>Backend: Certificate List
        Backend-->>Frontend: Display Requests

        Administrator->>Frontend: Select Template & Approve
        Frontend->>Backend: POST /api/certificates/approve/{id}
        Backend->>Database: Update Certificate Status
        Backend->>Backend: Generate Reference Number
        Backend->>PDFGenerator: Generate PDF with Template
        PDFGenerator->>Backend: PDF Buffer
        Backend->>Backend: Generate QR Code
        Backend->>FileStorage: Save PDF & QR Files
        Backend->>Database: Update Certificate Record
        Backend-->>Frontend: Certificate Generated
        Frontend-->>Administrator: Show Success
    end

    %% QR Verification Flow
    rect rgb(255, 240, 245)
        PublicUser->>PublicUser: Scan QR Code
        PublicUser->>Frontend: Open Verification URL
        Frontend->>Backend: GET /api/certificates/verify/{ref}
        Backend->>Database: Query Certificate by Reference
        Database-->>Backend: Certificate Data
        Backend->>Backend: Log Verification Attempt
        Backend->>Database: Insert Verification Log
        Backend-->>Frontend: Certificate Details + Status
        Frontend-->>PublicUser: Display Verified Certificate
    end
```

---

## Activity Diagram

```mermaid
stateDiagram-v2
    [*] --> LoginChoice

    state LoginChoice as "User Choice"
    LoginChoice --> StudentLogin : Student Login
    LoginChoice --> AdminLogin : Admin Login
    LoginChoice --> PublicVerification : Public QR Scan

    %% Student Flow
    state StudentLogin as "Student Authentication"
    StudentLogin --> StudentDashboard : Login Success
    StudentLogin --> LoginChoice : Login Failed

    state StudentDashboard as "Student Dashboard"
    StudentDashboard --> CertificateRequest : Apply Certificate
    StudentDashboard --> ViewStatus : View Status
    StudentDashboard --> DownloadCertificate : Download Certificate
    StudentDashboard --> ChangePassword : Change Password
    StudentDashboard --> Logout : Logout

    state CertificateRequest as "Certificate Application"
    CertificateRequest --> StudentDashboard : Request Submitted

    state ViewStatus as "View Certificate Status"
    ViewStatus --> StudentDashboard : Status Viewed

    state DownloadCertificate as "Download Certificate"
    DownloadCertificate --> StudentDashboard : Download Complete

    state ChangePassword as "Password Change"
    ChangePassword --> StudentDashboard : Password Updated

    %% Admin Flow
    state AdminLogin as "Admin Authentication"
    AdminLogin --> AdminDashboard : Login Success
    AdminLogin --> LoginChoice : Login Failed

    state AdminDashboard as "Admin Dashboard"
    AdminDashboard --> ReviewRequests : Review Requests
    AdminDashboard --> ManageTemplates : Manage Templates
    AdminDashboard --> ManageUsers : Manage Users
    AdminDashboard --> ViewLogs : View QR Logs
    AdminDashboard --> AdminChangePassword : Change Password
    AdminDashboard --> AdminLogout : Logout

    state ReviewRequests as "Certificate Requests Review"
    ReviewRequests --> SelectTemplate : Review Details
    SelectTemplate --> GenerateCertificate : Template Selected
    GenerateCertificate --> AdminDashboard : Certificate Generated

    state ManageTemplates as "Template Management"
    ManageTemplates --> UploadTemplate : Upload New
    UploadTemplate --> AdminDashboard : Template Added
    ManageTemplates --> EditTemplate : Edit Existing
    EditTemplate --> AdminDashboard : Template Updated
    ManageTemplates --> DeleteTemplate : Delete Template
    DeleteTemplate --> AdminDashboard : Template Deleted

    state ManageUsers as "User Management"
    ManageUsers --> ViewUsers : View All Users
    ViewUsers --> AdminDashboard : Users Listed
    ManageUsers --> EditUser : Edit User
    EditUser --> AdminDashboard : User Updated

    state ViewLogs as "QR Verification Logs"
    ViewLogs --> AdminDashboard : Logs Displayed

    state AdminChangePassword as "Admin Password Change"
    AdminChangePassword --> AdminDashboard : Password Updated

    %% Public Verification Flow
    state PublicVerification as "Public QR Verification"
    PublicVerification --> VerifyCertificate : QR Scanned
    VerifyCertificate --> DisplayResult : Verification Complete
    DisplayResult --> [*] : Close Browser

    %% Logout States
    Logout --> [*]
    AdminLogout --> [*]

    %% Styling
    classDef student fill:#e1f5fe,stroke:#01579b
    classDef admin fill:#f3e5f5,stroke:#4a148c
    classDef public fill:#e8f5e8,stroke:#1b5e20
    classDef system fill:#fff3e0,stroke:#e65100

    class StudentLogin,StudentDashboard,CertificateRequest,ViewStatus,DownloadCertificate,ChangePassword student
    class AdminLogin,AdminDashboard,ReviewRequests,SelectTemplate,GenerateCertificate,ManageTemplates,UploadTemplate,EditTemplate,DeleteTemplate,ManageUsers,ViewUsers,EditUser,ViewLogs,AdminChangePassword admin
    class PublicVerification,VerifyCertificate,DisplayResult public
```

---

## System Architecture Diagram

```mermaid
graph TB
    %% User Layer
    subgraph "User Layer"
        STU[👨‍🎓 Student<br/>Browser]
        ADM[👨‍💼 Administrator<br/>Browser]
        PUB[🌐 Public User<br/>Browser/Mobile]
    end

    %% Presentation Layer
    subgraph "Presentation Layer"
        subgraph "Frontend Application"
            REACT[⚛️ React.js<br/>SPA]
            ROUTER[🔀 React Router<br/>Navigation]
            COMPONENTS[🧩 UI Components<br/>Forms, Tables, Modals]
            HOOKS[🪝 Custom Hooks<br/>Session, API Calls]
        end
    end

    %% Application Layer
    subgraph "Application Layer"
        subgraph "Backend API"
            EXPRESS[🚀 Express.js<br/>Web Server]
            MIDDLEWARE[🔧 Middleware<br/>Auth, CORS, Validation]

            subgraph "Controllers"
                AUTH_CTRL[🔐 Auth Controller<br/>Login, Register, OTP]
                CERT_CTRL[📜 Certificate Controller<br/>Generate, Approve, Verify]
                TEMP_CTRL[📄 Template Controller<br/>CRUD Operations]
                USER_CTRL[👥 User Controller<br/>Profile Management]
            end

            subgraph "Routes"
                AUTH_ROUTES[/api/auth/*]
                CERT_ROUTES[/api/certificates/*]
                TEMP_ROUTES[/api/templates/*]
                USER_ROUTES[/api/users/*]
            end
        end
    end

    %% Business Logic Layer
    subgraph "Business Logic Layer"
        subgraph "Services"
            EMAIL_SVC[📧 Email Service<br/>Nodemailer]
            PDF_SVC[📄 PDF Service<br/>Puppeteer]
            QR_SVC[📱 QR Service<br/>qrcode]
            ENCRYPT_SVC[🔒 Encryption Service<br/>AES-256-CBC]
            SESSION_SVC[💾 Session Service<br/>express-session]
        end
    end

    %% Data Access Layer
    subgraph "Data Access Layer"
        subgraph "Database Layer"
            MYSQL[(🗄️ MySQL Database<br/>Connection Pool)]
            DB_CONFIG[⚙️ Database Config<br/>Connection Settings]
        end

        subgraph "File Storage"
            CERT_FILES[📁 Certificate PDFs<br/>/public/certificates/]
            QR_FILES[📁 QR Code Images<br/>/public/qr-codes/]
            TEMP_FILES[📁 Templates<br/>/public/templates/]
            ASSET_FILES[📁 Assets<br/>/public/assets/]
        end
    end

    %% Infrastructure Layer
    subgraph "Infrastructure Layer"
        subgraph "External Services"
            SMTP[📮 SMTP Server<br/>Gmail/Outlook]
            FILE_SYSTEM[💿 Local File System<br/>Disk Storage]
        end
    end

    %% Data Flow
    STU --> REACT
    ADM --> REACT
    PUB --> REACT

    REACT --> ROUTER
    ROUTER --> COMPONENTS
    COMPONENTS --> HOOKS

    HOOKS --> EXPRESS
    EXPRESS --> MIDDLEWARE
    MIDDLEWARE --> AUTH_ROUTES
    MIDDLEWARE --> CERT_ROUTES
    MIDDLEWARE --> TEMP_ROUTES
    MIDDLEWARE --> USER_ROUTES

    AUTH_ROUTES --> AUTH_CTRL
    CERT_ROUTES --> CERT_CTRL
    TEMP_ROUTES --> TEMP_CTRL
    USER_ROUTES --> USER_CTRL

    AUTH_CTRL --> EMAIL_SVC
    AUTH_CTRL --> ENCRYPT_SVC
    AUTH_CTRL --> SESSION_SVC

    CERT_CTRL --> PDF_SVC
    CERT_CTRL --> QR_SVC
    CERT_CTRL --> EMAIL_SVC

    TEMP_CTRL --> FILE_SYSTEM

    AUTH_CTRL --> MYSQL
    CERT_CTRL --> MYSQL
    TEMP_CTRL --> MYSQL
    USER_CTRL --> MYSQL

    PDF_SVC --> CERT_FILES
    QR_SVC --> QR_FILES
    TEMP_CTRL --> TEMP_FILES

    EMAIL_SVC --> SMTP
    PDF_SVC --> FILE_SYSTEM
    QR_SVC --> FILE_SYSTEM

    %% Styling
    classDef frontend fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef services fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef data fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef infra fill:#ffebee,stroke:#d32f2f,stroke-width:2px

    class REACT,ROUTER,COMPONENTS,HOOKS frontend
    class EXPRESS,MIDDLEWARE,AUTH_CTRL,CERT_CTRL,TEMP_CTRL,USER_CTRL,AUTH_ROUTES,CERT_ROUTES,TEMP_ROUTES,USER_ROUTES backend
    class EMAIL_SVC,PDF_SVC,QR_SVC,ENCRYPT_SVC,SESSION_SVC services
    class MYSQL,DB_CONFIG,CERT_FILES,QR_FILES,TEMP_FILES,ASSET_FILES data
    class SMTP,FILE_SYSTEM infra
```

---

## Database Schema Diagram

```mermaid
erDiagram
    users {
        int id PK
        varchar username UK
        varchar email UK
        varchar password
        tinyint role "0=student, 1=admin"
        varchar full_name
        varchar roll_number UK
        varchar course
        varchar branch
        timestamp created_at
        timestamp updated_at
    }

    certificates {
        int id PK
        varchar reference_num UK
        varchar serial_num
        varchar full_name
        varchar roll_number
        varchar parent_name
        enum gender "M/F"
        varchar certificate_type
        varchar course
        varchar branch
        varchar present_year
        varchar academic_year
        datetime issued_date
        varchar status "pending/approved/rejected"
        int user_id FK
        int template_id FK
        varchar qr_code_path
        varchar verification_token
        timestamp created_at
        timestamp updated_at
    }

    certificate_templates {
        int id PK
        varchar name
        varchar type
        text description
        longtext html_content
        longtext css_styles
        varchar background_image
        varchar logo_path
        varchar hod_signature
        varchar principal_signature
        boolean is_active
        int created_by FK
        timestamp created_at
        timestamp updated_at
    }

    qr_verification_logs {
        int id PK
        int certificate_id FK
        varchar reference_num
        datetime timestamp
        varchar ip_address
        text user_agent
        boolean is_valid
        text error_message
        timestamp created_at
    }

    otp_records {
        int id PK
        varchar email
        varchar otp_code "encrypted"
        varchar purpose "registration/password_reset"
        datetime expires_at
        boolean is_used
        timestamp created_at
    }

    users ||--o{ certificates : "requests"
    users ||--o{ certificate_templates : "creates"
    certificates ||--|| qr_verification_logs : "generates"
    certificates }o--|| certificate_templates : "uses"
    users ||--o{ otp_records : "has"
```

---

## Component Interaction Flow

```mermaid
flowchart TD
    A[User Action] --> B{Authentication Required?}

    B -->|Yes| C[Check Session]
    B -->|No| D[Public Access]

    C --> E{Session Valid?}
    E -->|Yes| F[Allow Access]
    E -->|No| G[Redirect to Login]

    D --> H[Allow Access]

    F --> I[Execute Business Logic]
    H --> I

    I --> J{Database Operation?}
    J -->|Yes| K[Execute Query]
    J -->|No| L[Process Logic]

    K --> M{Query Success?}
    M -->|Yes| N[Return Data]
    M -->|No| O[Handle DB Error]

    L --> P{External Service?}
    P -->|Yes| Q[Call Service]
    P -->|No| R[Process Complete]

    Q --> S{Service Success?}
    S -->|Yes| T[Process Result]
    S -->|No| U[Handle Service Error]

    N --> V[Format Response]
    T --> V
    R --> V
    O --> W[Error Response]
    U --> W

    V --> X[Send Response]
    W --> X

    X --> Y[Log Activity]
    Y --> Z[End Request]

    %% Styling
    classDef decision fill:#fff3cd,stroke:#856404,stroke-width:2px
    classDef process fill:#d1ecf1,stroke:#0c5460,stroke-width:2px
    classDef success fill:#d4edda,stroke:#155724,stroke-width:2px
    classDef error fill:#f8d7da,stroke:#721c24,stroke-width:2px

    class B,E,J,M,P,S decision
    class I,K,L,Q,Y process
    class F,H,N,T,R,V,X,Z success
    class G,O,U,W error
```

---

## Security Architecture

```mermaid
mindmap
  root((🔒 Security Architecture))
    Authentication
      Session Management
        express-session
        Secure cookies
        Session timeout
      Password Security
        bcrypt hashing
        Salt rounds: 10
        No plain text storage
      OTP System
        AES-256-CBC encryption
        Time-based expiration
        Single-use tokens
    Authorization
      Role-Based Access
        Admin (role=1)
        Student (role=0)
      Route Protection
        Middleware validation
        Session verification
        Role checking
    Data Protection
      Input Validation
        Server-side validation
        SQL injection prevention
        XSS protection
      Encryption
        OTP encryption
        Secure token generation
        Environment variables
    Network Security
      CORS Configuration
        Restricted origins
        Credential handling
      HTTPS Ready
        SSL/TLS support
        Secure headers
    File Security
      Upload Validation
        File type checking
        Size limits
        Path sanitization
      Access Control
        Public file serving
        Directory restrictions
    Audit & Monitoring
      Activity Logging
        QR verification logs
        IP address tracking
        User agent logging
      Error Handling
        Centralized logging
        Secure error messages
        No sensitive data exposure
```

---

## Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        subgraph "Load Balancer"
            LB[🔄 Nginx/HAProxy<br/>Load Balancer]
        end

        subgraph "Application Servers"
            APP1[🚀 Node.js App Server 1<br/>Port 5000]
            APP2[🚀 Node.js App Server 2<br/>Port 5000]
        end

        subgraph "Database Cluster"
            MASTER[(🗄️ MySQL Master<br/>Write Operations)]
            SLAVE1[(🗄️ MySQL Slave 1<br/>Read Operations)]
            SLAVE2[(🗄️ MySQL Slave 2<br/>Read Operations)]
        end

        subgraph "File Storage"
            NFS[📁 NFS/S3<br/>Shared File System]
        end

        subgraph "Cache Layer"
            REDIS[(🔴 Redis Cache<br/>Session Store)]
        end

        subgraph "Email Service"
            SES[📧 AWS SES/SMTP<br/>Email Service]
        end

        subgraph "Monitoring"
            MONITOR[📊 Monitoring Stack<br/>PM2 + Logs]
        end
    end

    subgraph "CDN & Static Assets"
        CDN[🌐 CDN<br/>Static Files]
    end

    subgraph "Backup & Recovery"
        BACKUP[💾 Automated Backups<br/>Database + Files]
    end

    %% Connections
    LB --> APP1
    LB --> APP2

    APP1 --> MASTER
    APP2 --> MASTER
    APP1 --> SLAVE1
    APP2 --> SLAVE1
    APP1 --> SLAVE2
    APP2 --> SLAVE2

    APP1 --> REDIS
    APP2 --> REDIS

    APP1 --> NFS
    APP2 --> NFS

    APP1 --> SES
    APP2 --> SES

    NFS --> CDN

    MASTER --> BACKUP
    SLAVE1 --> BACKUP
    SLAVE2 --> BACKUP
    NFS --> BACKUP

    APP1 --> MONITOR
    APP2 --> MONITOR
    MASTER --> MONITOR
    SLAVE1 --> MONITOR
    SLAVE2 --> MONITOR

    %% Styling
    classDef loadbalancer fill:#e3f2fd,stroke:#1976d2
    classDef appserver fill:#f3e5f5,stroke:#7b1fa2
    classDef database fill:#e8f5e8,stroke:#388e3c
    classDef storage fill:#fff3e0,stroke:#f57c00
    classDef cache fill:#fce4ec,stroke:#c2185b
    classDef external fill:#f1f8e9,stroke:#558b2f
    classDef monitoring fill:#e0f2f1,stroke:#00695c

    class LB loadbalancer
    class APP1,APP2 appserver
    class MASTER,SLAVE1,SLAVE2 database
    class NFS storage
    class REDIS cache
    class SES,CDN external
    class MONITOR monitoring
```

---

## Performance Characteristics

### Response Times (Expected)

- **Authentication**: 200-500ms
- **Certificate Generation**: 2-5 seconds
- **QR Verification**: 100-300ms
- **Template Upload**: 500ms-2s
- **Database Queries**: 50-200ms

### Scalability Metrics

- **Concurrent Users**: 1000+ (with load balancer)
- **Certificates/Day**: 10,000+ (with PDF optimization)
- **Storage Growth**: 100MB/month (certificates + QR codes)
- **Database Size**: 1GB/year (with archiving)

### Monitoring Points

- **Application**: Response times, error rates, throughput
- **Database**: Query performance, connection pool usage
- **File System**: Storage usage, file access patterns
- **External Services**: Email delivery rates, SMTP response times

---

## Summary

This comprehensive system architecture provides a robust, scalable, and secure foundation for the eCerti digital certificate management system. The modular design ensures maintainability, while the security-first approach protects sensitive educational data. The UML diagrams illustrate the complete system interactions, data flows, and component relationships essential for development, deployment, and maintenance.
