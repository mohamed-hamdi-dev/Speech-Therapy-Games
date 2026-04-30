const express = require('express');
const multer = require('multer');
const path = require('path');
const env = require('../config/env');
const { uploadFile } = require('../controllers/upload.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, env.uploadsDir);
  },
  filename: (_req, file, callback) => {
    callback(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.post(
  '/api/upload',
  authenticate,
  authorize('SUPER_ADMIN', 'THERAPIST'),
  upload.single('file'),
  uploadFile
);

module.exports = router;
