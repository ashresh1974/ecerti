# eCertificate (ecerti) - Vercel Deployment Guide

## Project Overview

The ecerti project is a full-stack e-Certificate Management System with:
- **Frontend**: React-based dashboard for students and administrators
- **Backend**: Express.js API server
- **Database**: MySQL for data persistence
- **Email**: Gmail SMTP for notifications

## Deployment Status

✅ **Preparation Complete**: The project has been configured for Vercel deployment with:
- Updated `vercel.json` with proper build and routing configuration
- All hardcoded `localhost:5000` URLs replaced with environment variable references
- Environment files configured for production
- Changes committed and pushed to GitHub

## Quick Start Deployment

### Step 1: Connect Your GitHub Repository to Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select **GitHub** as your Git provider
4. Search for and select **`ashresh1974/ecerti`** repository
5. Click **"Import"**

### Step 2: Configure Project Settings

In the Vercel import dialog:

**Project Name**: `ecerti` (or your preferred name)

**Framework Preset**: Leave as **"Other"** (auto-detected)

**Root Directory**: Leave empty (uses project root)

### Step 3: Set Environment Variables

Click **"Environment Variables"** and add the following:

| Variable Name | Value | Notes |
|---|---|---|
| `DB_HOST` | `localhost` | Your MySQL host (or managed database URL) |
| `DB_USER` | `root` | Your MySQL username |
| `DB_PASSWORD` | `D.Ashresh@1974` | Your MySQL password |
| `DB_DATABASE` | `ecertificate` | Your database name |
| `EMAIL_USER` | `mguecertificate@gmail.com` | Gmail address for sending emails |
| `EMAIL_PASS` | `gdrdpjaqashsiotw` | Gmail app password |
| `SESSION_SECRET` | `your_session_secret_key_vercel_deployment` | Session encryption key |
| `FRONTEND_URL` | `https://ecerti.vercel.app` | Your Vercel deployment URL |
| `NODE_ENV` | `production` | Environment mode |

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (typically 2-5 minutes)
3. Once successful, you'll receive your deployment URL

## Important Notes

### Database Connection

**⚠️ CRITICAL**: The current configuration expects a MySQL database accessible from Vercel's servers.

**Options:**

1. **Use a Managed Database Service** (Recommended):
   - PlanetScale (MySQL-compatible)
   - AWS RDS
   - DigitalOcean Managed Databases
   - Google Cloud SQL
   - Azure Database for MySQL

2. **Keep Local MySQL**:
   - Ensure your MySQL server is accessible from the internet
   - Update `DB_HOST` to your server's public IP or domain
   - Configure firewall to allow Vercel's IP ranges

### File Storage

The application writes files to the local filesystem:
- `/backend/public/certificates/` - Generated PDF certificates
- `/backend/public/templates/` - Certificate templates
- `/backend/public/qr-codes/` - QR code images

**⚠️ WARNING**: These files are **NOT persistent** on Vercel's serverless platform.

**Solution**: Migrate file storage to:
- AWS S3
- Google Cloud Storage
- Azure Blob Storage
- Vercel Blob Storage

### Session Management

The app uses Express sessions with cookies. This works on Vercel but:
- Sessions are stored in-memory and will be lost on redeployment
- For production, consider using a session store (Redis, MongoDB)

## Deployment URL

After successful deployment, your application will be available at:
```
https://ecerti.vercel.app
```

Or a custom domain if you configure one.

## Frontend URL Updates

All frontend components have been updated to use the environment variable `REACT_APP_BACKEND_URL`. The build process will automatically use the value from `.env.production`:

```
REACT_APP_BACKEND_URL=https://ecerti.vercel.app
```

## Monitoring Deployments

1. Go to your Vercel dashboard: [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select the **ecerti** project
3. View deployment history, logs, and analytics
4. Monitor build and runtime logs for any issues

## Troubleshooting

### Build Fails

Check the build logs in Vercel dashboard:
1. Go to Deployments tab
2. Click on the failed deployment
3. View "Build Logs" for error details

Common issues:
- Missing dependencies: Check `backend/package.json` and `frontend/package.json`
- Environment variables not set: Verify all required variables are configured
- Database connection error: Ensure database is accessible

### Runtime Errors

Check the runtime logs:
1. Go to Deployments tab
2. Click on the deployment
3. View "Runtime Logs" for application errors

### Database Connection Issues

Verify:
- Database host is reachable from Vercel
- Credentials are correct
- Database exists and is initialized
- Firewall allows Vercel's IP ranges

## Next Steps

1. **Migrate to Managed Database**: Move from local MySQL to a cloud database service
2. **Setup File Storage**: Configure S3 or similar for persistent file storage
3. **Add Custom Domain**: Point your domain to the Vercel deployment
4. **Setup CI/CD**: Configure automatic deployments on GitHub push
5. **Monitor Performance**: Use Vercel Analytics to track application performance

## Support

For Vercel-specific issues:
- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support

For ecerti-specific issues:
- GitHub Repository: https://github.com/ashresh1974/ecerti
- Project README: Check `/README.md` in the repository

## Configuration Files

### vercel.json
The main Vercel configuration file that defines:
- Build command: Installs dependencies for both backend and frontend
- Output directory: Frontend build output
- Environment variables: Production variables
- Routes: API and static file routing

### .env Files
- `backend/.env`: Backend environment variables
- `frontend/.env.production`: Frontend production environment variables

## Architecture

```
ecerti/
├── backend/
│   ├── src/
│   │   ├── server.js (Express app)
│   │   ├── config/ (Database, Email)
│   │   ├── controllers/ (Business logic)
│   │   ├── routes/ (API endpoints)
│   │   └── middlewares/
│   ├── public/ (Static files, certificates, templates)
│   └── package.json
├── frontend/
│   ├── src/ (React components)
│   ├── build/ (Production build)
│   └── package.json
├── vercel.json (Deployment config)
└── README.md
```

## Build Process

When you deploy to Vercel:

1. **Install Backend Dependencies**: `cd backend && npm install`
2. **Install Frontend Dependencies**: `cd frontend && npm install`
3. **Build Frontend**: `npm run build` (creates optimized React bundle)
4. **Output**: Frontend build served as static assets, backend API available at `/api/*`

## Deployment Checklist

- [ ] GitHub repository connected to Vercel
- [ ] All environment variables configured
- [ ] Database is accessible from Vercel
- [ ] Build completes successfully
- [ ] Frontend loads without errors
- [ ] API endpoints respond correctly
- [ ] Email notifications work
- [ ] Certificate generation works
- [ ] File storage strategy implemented
- [ ] Custom domain configured (optional)

---

**Last Updated**: June 17, 2026
**Project**: ecerti v1.0
**Status**: Ready for Deployment
