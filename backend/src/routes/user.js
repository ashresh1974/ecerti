const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/user/details', userController.getDetails);
router.post('/certificate/apply', userController.applyCertificate);
router.put('/user/update/:id', userController.updateProfile);
router.get('/admin/students', userController.getAllStudents);
router.get('/admin/student/:id', userController.getStudentById);

module.exports = router;
