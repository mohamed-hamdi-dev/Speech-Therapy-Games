const env = require('../config/env');

function uploadFile(req, res) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded.',
    });
  }

  return res.status(201).json({
    success: true,
    url: `http://localhost:${env.port}/uploads/${req.file.filename}`,
    filename: req.file.filename,
  });
}

module.exports = {
  uploadFile,
};
