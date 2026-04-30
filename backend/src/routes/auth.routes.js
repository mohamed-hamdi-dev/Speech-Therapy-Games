const express = require('express');
const { body } = require('express-validator');
const { login, studentLogin } = require('../controllers/auth.controller');
const { validateRequest } = require('../middleware/validate.middleware');

const router = express.Router();

router.post(
  '/api/auth/login',
  [
    body('email').isEmail().withMessage('A valid email is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    validateRequest,
  ],
  login
);

router.post(
  '/api/student/login',
  [
    body('accessCode').trim().isLength({ min: 4 }).withMessage('A valid access code is required.'),
    validateRequest,
  ],
  studentLogin
);

module.exports = router;
