const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/user/details', userController.getDetails);
router.put('/user/update/:id', userController.updateProfile);
router.put('/user/change-password', userController.changePassword);
router.get('/admin/students', userController.getAllStudents);
router.get('/admin/student/:id', userController.getStudentById);

module.exports = router;
