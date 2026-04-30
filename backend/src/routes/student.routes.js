const express = require('express');
const { body, param } = require('express-validator');
const {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/student.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');

const router = express.Router();

router.use(authenticate, authorize('SUPER_ADMIN', 'THERAPIST'));

router.get('/api/students', getStudents);

router.post(
  '/api/students',
  [
    body('name').trim().notEmpty().withMessage('Student name is required.'),
    body('age').isInt({ min: 1, max: 25 }).withMessage('Age must be between 1 and 25.'),
    body('diagnosis').optional().isString().withMessage('Diagnosis must be text.'),
    body('currentLevel').optional().isInt({ min: 1 }).withMessage('Current level must be 1 or higher.'),
    body('therapistId').optional().notEmpty().withMessage('Therapist id cannot be empty.'),
    body('assignedGameIds').optional().isArray().withMessage('assignedGameIds must be an array.'),
    body('assignedGameIds.*').optional().notEmpty().withMessage('Assigned game id is required.'),
    validateRequest,
  ],
  createStudent
);

router.put(
  '/api/students/:id',
  [
    param('id').notEmpty().withMessage('Student id is required.'),
    body('name').optional().trim().notEmpty().withMessage('Student name cannot be empty.'),
    body('age').optional().isInt({ min: 1, max: 25 }).withMessage('Age must be between 1 and 25.'),
    body('diagnosis').optional().isString().withMessage('Diagnosis must be text.'),
    body('currentLevel').optional().isInt({ min: 1 }).withMessage('Current level must be 1 or higher.'),
    body('therapistId').optional().notEmpty().withMessage('Therapist id cannot be empty.'),
    body('assignedGameIds').optional().isArray().withMessage('assignedGameIds must be an array.'),
    body('assignedGameIds.*').optional().notEmpty().withMessage('Assigned game id is required.'),
    validateRequest,
  ],
  updateStudent
);

router.delete(
  '/api/students/:id',
  [param('id').notEmpty().withMessage('Student id is required.'), validateRequest],
  deleteStudent
);

module.exports = router;
