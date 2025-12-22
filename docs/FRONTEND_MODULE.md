# Frontend Module Documentation

## Overview
The Frontend Module is the client-side component of the e-Certificate System, built with React.js. It provides a user-friendly interface for students, administrators, and other users to interact with the certificate system, including registration, login, certificate generation, and management.

## Architecture
- **Framework**: React.js
- **Routing**: React Router
- **State Management**: React Hooks (useState, useEffect)
- **Styling**: CSS modules and custom styles
- **HTTP Client**: Fetch API
- **Build Tool**: Create React App (CRA)

## Directory Structure
```
frontend/
├── src/
│   ├── index.jsx              # Application entry point
│   ├── App.jsx                # Main App component
│   ├── components/
│   │   ├── ProtectedRoute.jsx         # Route protection
│   │   ├── ProtectedRouteAdmin.jsx    # Admin route protection
│   │   └── ProtectedRouteStudent.jsx  # Student route protection
│   ├── pages/                 # Page components
│   ├── login/                 # Login page
│   ├── register/              # Registration page
│   ├── forgotpassword/        # Password reset
│   ├── admindashboard/        # Admin dashboard components
│   │   ├── AdminDash.jsx
│   │   ├── CertificateRequests.jsx
│   │   ├── ChangePassword.jsx
│   │   ├── IssuedCertificates.jsx
│   │   ├── QRVerificationLogs.jsx
│   │   ├── RequestDetails.jsx
│   │   ├── StudentDetails.jsx
│   │   └── StudentManagement.jsx
│   ├── studentdashboard/      # Student dashboard
│   ├── hooks/
│   │   └── useSessionTimeout.js  # Session timeout hook
│   └── styles/                # Global styles
├── public/
│   ├── index.html            # HTML template
│   ├── manifest.json         # PWA manifest
│   └── assets/               # Static assets
├── build/                    # Production build
└── package.json              # Dependencies
```

## Key Components

### App Component (App.jsx)
- Main application component
- Route configuration with React Router
- Global state management
- Theme and layout setup

### Route Protection Components
- **ProtectedRoute.jsx**: General route protection
- **ProtectedRouteAdmin.jsx**: Admin-only routes
- **ProtectedRouteStudent.jsx**: Student-only routes
- Session validation and redirection

### Authentication Pages
- **Login**: User authentication
- **Register**: User registration with OTP verification
- **ForgotPassword**: Password reset flow

### Dashboard Components

#### Admin Dashboard
- **AdminDash.jsx**: Main admin interface
- **CertificateRequests.jsx**: Manage certificate requests
- **IssuedCertificates.jsx**: View issued certificates
- **StudentManagement.jsx**: Manage student accounts
- **QRVerificationLogs.jsx**: QR code verification history
- **ChangePassword.jsx**: Admin password change

#### Student Dashboard
- Certificate request submission
- View issued certificates
- Profile management
- QR code verification

### Hooks
- **useSessionTimeout.js**: Automatic logout on inactivity

## User Interface Features

### Responsive Design
- Mobile-first approach
- Adaptive layouts for different screen sizes
- Touch-friendly interactions

### Form Validation
- Real-time input validation
- Error message display
- OTP verification flow

### Loading States
- Loading indicators for async operations
- Disabled states during processing
- User feedback for actions

### Error Handling
- User-friendly error messages
- Network error handling
- Form validation feedback

## State Management
- Local component state with useState
- Session storage for authentication
- Local storage for user preferences
- Context API for global state (if needed)

## API Integration
- RESTful API calls using Fetch
- Authentication headers
- Error handling for API responses
- Loading states during requests

## Security Features
- Input sanitization
- XSS protection
- Secure session handling
- Route protection

## Styling
- Custom CSS classes
- Responsive design patterns
- Consistent color scheme
- Accessibility considerations

## Dependencies
- `react`: UI framework
- `react-dom`: DOM rendering
- `react-router-dom`: Client-side routing
- `react-scripts`: Build scripts

## Environment Configuration
- API base URL configuration
- Development vs production settings
- Proxy settings for development

## Performance Optimization
- Code splitting
- Lazy loading of components
- Image optimization
- Bundle size management

## Testing
- Component testing with React Testing Library
- E2E testing with Cypress
- User interaction testing

## Deployment
- Build process with `npm run build`
- Static file serving
- CDN integration for assets
- Service worker for PWA features

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement

## Accessibility
- Semantic HTML
- Keyboard navigation
- Screen reader support
- Color contrast compliance

## User Experience
- Intuitive navigation
- Clear feedback messages
- Progressive disclosure
- Consistent interaction patterns