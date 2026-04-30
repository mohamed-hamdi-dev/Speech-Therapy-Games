const express = require('express');
const { body, param } = require('express-validator');
const {
  getGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
} = require('../controllers/game.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');

const router = express.Router();

router.get('/api/games', getGames);
router.get('/api/games/:id', [param('id').notEmpty().withMessage('Game id is required.'), validateRequest], getGame);

router.post(
  '/api/games',
  [
    authenticate,
    authorize('SUPER_ADMIN', 'THERAPIST'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.'),
    body('type').trim().notEmpty().withMessage('Game type is required.'),
    body('level').isInt({ min: 1 }).withMessage('Level must be at least 1.'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean.'),
    validateRequest,
  ],
  createGame
);

router.put(
  '/api/games/:id',
  [
    authenticate,
    authorize('SUPER_ADMIN', 'THERAPIST'),
    param('id').notEmpty().withMessage('Game id is required.'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.'),
    body('type').trim().notEmpty().withMessage('Game type is required.'),
    body('level').isInt({ min: 1 }).withMessage('Level must be at least 1.'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean.'),
    validateRequest,
  ],
  updateGame
);

router.delete(
  '/api/games/:id',
  [
    authenticate,
    authorize('SUPER_ADMIN', 'THERAPIST'),
    param('id').notEmpty().withMessage('Game id is required.'),
    validateRequest,
  ],
  deleteGame
);

module.exports = router;
