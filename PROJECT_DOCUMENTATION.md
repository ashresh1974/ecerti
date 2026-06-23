# Project Documentation: eCerti (e-Certificate Management System)

## What this is

eCerti is an e‑Certificate Management System built with a React frontend and an Express.js backend. It issues, serves, verifies, and exports certificates (PDF/HTML), supports QR codes and email distribution, and uses MySQL for persistence. Intended users are event/education administrators who create certificates and end-users/third-parties who view or verify them.

---

## Stack

- **Language(s):** JavaScript (frontend + backend), CSS
- **Framework / runtime:**
  - Backend: Node.js + Express
  - Frontend: React (Create React App / react-scripts)
- **Notable libraries:**
  - Backend: express, mysql, express-session, bcrypt, multer, nodemailer, pdfkit, html-pdf, puppeteer, qrcode
  - Frontend: react, axios, react-router-dom, jspdf, html2canvas
  - Utilities: dotenv, cors

---

## Top-level structure

```
.github/                  GitHub metadata & copilot-instructions.md
ENVIRONMENT_VARIABLES.txt guidance for required env vars
.vscode/                 editor settings
README.md                repo README
VERCEL_DEPLOYMENT_GUIDE.md guidance for deploying to Vercel
render.yaml              sample Render deployment config
vercel.json              Vercel configuration for frontend deploy
build.sh                 helper build script
frontend/                React app (Create React App)
backend/                 Express backend
PROJECT_DOCUMENTATION.md (this file)
```

---

## How it's organized (annotated)

```
frontend/
  package.json           frontend scripts & dependencies
  src/                   React source (components, pages, assets, routes)
  build/                 production build output (checked in)
  README.md              frontend-specific docs

backend/
  package.json           backend scripts & dependencies
  .env.example           example environment variables (DB, EMAIL, SESSION_SECRET)
  src/
    server.js            main Express server (entry point)
    config/              db config and other config files (e.g., db.js)
    controllers/         business logic (certificateController referenced)
    routes/              auth, user, certificate, templates route handlers
    middlewares/         auth middleware and upload/validation middleware
    public/              static assets (certificates, templates, qr-codes, assets)

.github/                 GitHub workflows & copilot instructions
```

How it fits together:
- Frontend is a single-page React app that communicates with the backend REST API (CORS allowed for common dev origins).
- Backend is an Express server (backend/src/server.js) that handles authentication, certificate creation/generation, PDF and QR generation, email distribution, and serves static certificate/template files. The MySQL DB stores metadata such as certificate entries and reference numbers.

---

## Main runtime flow and components

1) Server startup (backend/src/server.js)
   - Loads environment variables with dotenv.
   - Initializes Express, CORS and express-session.
   - Serves static assets from backend/public and falls back to frontend assets for /assets.
   - Adds a request logger for POST/PUT and logs session info (dev-focused).
   - Wires route handlers and a public verification endpoint.

2) Authentication & sessions
   - Uses express-session to manage sessions with a server-side session store (default memory store in current code). The isAuthenticated middleware allows access when req.session.user exists.

3) Certificate operations
   - Certificate creation/uploads use multer (file upload). PDFs are generated using pdf libraries (pdfkit, html-pdf, puppeteer) and QR codes via qrcode package.
   - Certificate files and QR images are stored under backend/public and served via static routes.
   - Certificate metadata (including reference_num) is stored in a MySQL table (accessed through backend/src/config/db.js).

4) Emailing
   - nodemailer is used to send emails with certificate links or attachments. SMTP provider and credentials are configured via environment variables.

5) Public verification & public details
   - Public endpoints exist so third parties can verify or fetch certificate details without authentication:
     - GET /api/certificate/verify/:reference_num
     - GET /api/certificate/public/details/:reference_num

---

## How to run it (shortest path)

Prerequisites:
- Node.js (14+), npm
- MySQL database (for full backend functionality)
- Copy backend/.env.example to backend/.env and fill required values

Backend (development):
```
cd backend
npm install
cp .env.example .env    # then edit .env to fill DB and email vars
npm start               # runs node src/server.js on PORT (default 5000)
```

Frontend (development):
```
cd frontend
npm install
npm start               # runs react dev server on port 3000
```

Run both simultaneously (two terminals): frontend on 3000, backend on 5000. Frontend will call backend /api endpoints (CORS is configured).

Production build & deploy (summary):
- Frontend: cd frontend && npm run build -> produces build/ folder to deploy to Vercel/Netlify or serve as static assets.
- Backend: set production env vars, use process manager or container to run node src/server.js. Use persistent session store and secure cookies.

---

## API highlights (observed)

- Public endpoints:
  - GET /api/certificate/public/details/:reference_num  -> returns certificate details (no auth)
  - GET /api/certificate/verify/:reference_num          -> verification endpoint (no auth)

- Auth / protected routes:
  - /api (auth routes are public)
  - /api (user routes are protected via isAuthenticated)
  - /api/certificate (protected create/edit/delete operations)
  - /api/templates (protected template CRUD operations)

- Static assets:
  - /certificates, /templates, /qr-codes, /assets

---

## Patterns, logic, and implementation notes

- Sessions: express-session used (default memory store). For production, use Redis or other persistent store and enable cookie.secure when using HTTPS.
- DB access: mysql package used with parameterized queries in places (good for SQL injection prevention). Look at backend/src/config/db.js for connection pooling and query helper functions.
- File handling: multer used for uploads; uploaded files are served from backend/public. Ensure upload validation (size/type) in middleware.
- PDF generation: multiple libraries (pdfkit, html-pdf, puppeteer) allow different generation strategies — check controllers to see which is used for which template.
- QR codes: qrcode package generates images publicly accessible via /qr-codes.
- Static /assets is mounted twice (backend/public/assets and frontend/src/assets) — this fallback can cause ambiguity in which asset is served.
- Some require paths in server.js use '../src/routes/...' which may be inconsistent; verify the pathing to avoid module resolution errors.

---

## Security & production hardening suggestions

- Replace in-memory session store with Redis (or similar) in production.
- Set cookie.secure to true when serving over HTTPS.
- Remove verbose console logging in production (may leak PII).
- Use helmet and rate limiting for protection against common web attacks.
- Enforce file upload validation (file types, sizes) and sanitize template inputs.
- Lock CORS origins to trusted production origins or configure dynamic origin checks.

---

## Troubleshooting common startup problems

- "Module not found" for routes: inspect require paths in backend/src/server.js and adjust to correct relative paths (e.g., './routes/certificate' might be intended instead of '../src/routes/certificate').
- DB connection errors: confirm DB_HOST, DB_USER, DB_PASSWORD, DB_NAME and that MySQL accepts connections from your host.
- CORS issues: ensure the frontend origin is included in allowed origins in server.js CORS config.
- Sessions/auth: ensure SESSION_SECRET is set and matches across environments as needed.

---

## Files to inspect next (for deeper docs)

- backend/src/config/db.js
- backend/src/controllers/certificateController.js
- backend/src/routes/certificate.js
- backend/src/routes/auth.js
- backend/src/routes/user.js
- backend/src/middlewares/*
- frontend/src/ (pages/components responsible for certificate creation, verification, and download)

---

## Suggested follow-up questions you can ask me

- "Show me the contents of backend/src/controllers/certificateController.js and summarize its verifyCertificate logic." 
- "Open backend/src/config/db.js and list the database tables and example queries used for certificates." 
- "Audit the server.js requires and fix any incorrect relative paths I should change before deploying."

---

(Generated by repository inspection. If you want this file modified — for example to include a full API reference (request/response schemas) or to add diagrams — tell me which areas to expand and I will update the file.)
