import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './index.css';
import './styles/shared.css';
import ProtectedRouteAdmin from './components/ProtectedRouteAdmin';
import ProtectedRouteStudent from './components/ProtectedRouteStudent';
import Login from './login/Login';
import Register from './register/Register';
import ForgotPass from './forgotpassword/ForgotPass';
import NewPass from './forgotpassword/newpassword/NewPass';
import PasswordResetSuccess from './forgotpassword/passwordresetsuccess/PasswordResetSuccess';
import CreatePass from './register/createpassword/CreatePass';
import RegisterSucc from './register/registeredsuccess/RegisterSucc';
import AdminDash from './admindashboard/AdminDash';
import StudDash from './studentdashboard/StudDash';
import StudentProfile from './studentdashboard/StudentProfile';
import ApplyCertificate from './studentdashboard/ApplyCertificate';
import CertificateStatus from './studentdashboard/CertificateStatus';
import DownloadCertificates from './studentdashboard/DownloadCertificates';
import CertificateView from './studentdashboard/CertificateView';
import ChangePassword from './studentdashboard/ChangePassword';
import StudentDetails from './admindashboard/StudentDetails';
import RequestDetails from './admindashboard/RequestDetails';
import VerifyCertificate from './pages/VerifyCertificate';

// Configure axios to send cookies for session management
axios.defaults.withCredentials = true;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotpassword" element={<ForgotPass />} />
        <Route path="/newpassword" element={<NewPass />} />
        <Route path="/passwordresetsuccess" element={<PasswordResetSuccess />} />
        <Route path="/createpassword" element={<CreatePass />} />
        <Route path="/registersuccess" element={<RegisterSucc />} />
        <Route path="/verify/:reference_num" element={<VerifyCertificate />} />
        {/* Public certificate viewer (open PDFs from /certificates by reference number) */}
        <Route path="/certificate-view/:reference_num" element={<CertificateView />} />

        {/* Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRouteAdmin>
              <AdminDash />
            </ProtectedRouteAdmin>
          }
        />
        <Route
          path="/admin/student-details/:id"
          element={
            <ProtectedRouteAdmin>
              <StudentDetails />
            </ProtectedRouteAdmin>
          }
        />
        <Route
          path="/admin/request/:reference_num"
          element={
            <ProtectedRouteAdmin>
              <RequestDetails />
            </ProtectedRouteAdmin>
          }
        />
        <Route
          path="/admin/certificate-requests"
          element={
            <ProtectedRouteAdmin>
              <AdminDash />
            </ProtectedRouteAdmin>
          }
        />
        <Route
          path="/admin/issued-certificates"
          element={
            <ProtectedRouteAdmin>
              <AdminDash />
            </ProtectedRouteAdmin>
          }
        />
        <Route
          path="/admin/student-management"
          element={
            <ProtectedRouteAdmin>
              <AdminDash />
            </ProtectedRouteAdmin>
          }
        />
        <Route
          path="/admin/change-password"
          element={
            <ProtectedRouteAdmin>
              <AdminDash />
            </ProtectedRouteAdmin>
          }
        />

        <Route
          path="/studentdashboard"
          element={
            <ProtectedRouteStudent>
              <StudDash />
            </ProtectedRouteStudent>
          }
        >
          <Route index element={<StudentProfile />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="apply-certificate" element={<ApplyCertificate />} />
          <Route path="certificate-status" element={<CertificateStatus />} />
          <Route path="download-certificates" element={<DownloadCertificates />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
