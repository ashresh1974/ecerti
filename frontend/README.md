# e-Certificate Management System

**Name:** Devarakonda Ashresh Kumar  
**Roll No:** 4511-22-733-008  
**Email:** dashreshkumar@gmail.com  
**Phone:** +91 9391448946

This is a full-stack web application for managing and issuing digital certificates. It includes user authentication, certificate generation with QR codes, and verification features.

## Prerequisites

Before running the project, ensure you have the following installed:
- **Node.js** (version 16 or higher) - Download from [nodejs.org](https://nodejs.org/)
- **MySQL** (version 8 or higher) - Download from [mysql.com](https://www.mysql.com/)
- **Git** (for cloning the repository, if needed)

## Project Structure

- `backend/` - Server-side code (Node.js, Express)
- `frontend/` - Client-side code (React.js)
- `docs/` - Documentation files

## Installation Steps

### 1. Clone or Navigate to the Project Directory
If not already done, navigate to the project root directory:
```
cd d:\ecerti
```

### 2. Install Backend Dependencies
Navigate to the backend folder and install dependencies:
```
cd backend
npm install
```
**Required Backend Dependencies:**
- `express` - Web framework
- `mysql` - Database connector
- `bcrypt` - Password hashing
- `nodemailer` - Email sending
- `puppeteer` - PDF generation
- `qrcode` - QR code generation
- `cors`, `dotenv`, `express-session`, `multer`, etc.

### 3. Install Frontend Dependencies
Navigate to the frontend folder and install dependencies:
```
cd ../frontend
npm install
```
**Required Frontend Dependencies:**
- `react` - UI library
- `react-router-dom` - Routing
- `axios` - HTTP client
- `jspdf` - PDF handling
- `react-icons` - Icons
- `@testing-library/react` - Testing utilities
- `html2canvas`, etc.

### 4. Setup Database
- Create a MySQL database named `ecerti` (or as per your configuration).
- Run the database schema scripts from `docs/DATABASE_MODULE.md` or create tables manually for users, certificates, etc.
- Ensure MySQL server is running.

### 5. Configure Environment Variables
In the `backend/` folder, create a `.env` file with the following variables (replace with your actual values):
```
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_DATABASE=ecerti
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
SESSION_SECRET=your_secret_key
```
- `DB_*` - MySQL connection details
- `EMAIL_*` - For sending emails (e.g., OTP)
- `SESSION_SECRET` - For session management

## Running the Application

### 1. Start the Backend Server
In the `backend/` folder:
```
npm start
```
This starts the server on `http://localhost:5000` (or as configured).

### 2. Start the Frontend Application
In a new terminal, in the `frontend/` folder:
```
npm start
```
This starts the React app on `http://localhost:3000`.

### 3. Access the Application
- Open your browser and go to `http://localhost:3000` to use the frontend.
- The backend APIs are available at `http://localhost:5000`.

## Additional Notes
- Ensure both backend and frontend are running simultaneously.
- For production, build the frontend with `npm run build` and serve the static files.
- Refer to `docs/` for detailed module documentation.
- If you encounter issues, check console logs for errors.

## Testing
Run tests for the frontend:
```
npm test
```
Backend tests are not configured yet.

## Learn More
- [React Documentation](https://reactjs.org/)
- [Express.js Guide](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)




## QR Code Verification Link

The QR code verification link is: `http://10.55.47.47:3000/verify/{reference_number}`
