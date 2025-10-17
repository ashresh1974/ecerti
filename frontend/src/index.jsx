import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App'; // Login page
import Register from './register/Register';
import ForgotPass from './forgotpassword/ForgotPass';
import NewPass from './forgotpassword/newpassword/NewPass';
import CreatePass from './register/createpassword/CreatePass';
import RegisterSucc from './register/registeredsuccess/RegisterSucc';
import AdminDash from './admindashboard/AdminDash';
import StudDash from './studentdashboard/StudDash';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotpassword" element={<ForgotPass />} />
        <Route path="/newpassword" element={<NewPass />} />
        <Route path="/createpassword" element={<CreatePass />} />
        <Route path="/registersuccess" element={<RegisterSucc />} /> {/* <- Consistent path */}
        <Route path="/admindashboard" element={<AdminDash />} />
        <Route path="/studentdashboard" element={<StudDash />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
