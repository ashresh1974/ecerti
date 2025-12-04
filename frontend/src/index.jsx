import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import ProtectedRouteAdmin from './components/ProtectedRouteAdmin';
import ProtectedRouteStudent from './components/ProtectedRouteStudent';
import Login from './login/Login';
import Register from './register/Register';
import ForgotPass from './forgotpassword/ForgotPass';
import NewPass from './forgotpassword/newpassword/NewPass';
import CreatePass from './register/createpassword/CreatePass';
import RegisterSucc from './register/registeredsuccess/RegisterSucc';
import AdminDash from './admindashboard/AdminDash';
import StudDash from './studentdashboard/StudDash';
import StudentProfile from './studentdashboard/StudentProfile';
import ApplyCertificate from './studentdashboard/ApplyCertificate';
import CertificateStatus from './studentdashboard/CertificateStatus';
import DownloadCertificates from './studentdashboard/DownloadCertificates';
import StudentDetails from './admindashboard/StudentDetails';
import RequestDetails from './admindashboard/RequestDetails';

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
        <Route path="/createpassword" element={<CreatePass />} />
        <Route path="/registersuccess" element={<RegisterSucc />} />

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
          path="/studentdashboard"
          element={
            <ProtectedRouteStudent>
              <StudDash />
            </ProtectedRouteStudent>
          }
        >
          <Route index element={<StudentProfile />} />
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
