const fs = require('fs');
const path = require('path');
const env = require('../config/env');

const IMAGE_FILE_REGEX = /\.(png|jpe?g|webp|gif|svg)$/i;

function buildFileUrl(req, filename) {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/uploads/${filename}`;
}

function uploadFile(req, res) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded.',
    });
  }

  return res.status(201).json({
    success: true,
    url: buildFileUrl(req, req.file.filename),
    filename: req.file.filename,
  });
}

function listUploadedFiles(req, res) {
  const query = String(req.query.query || '').trim().toLowerCase();

  if (!fs.existsSync(env.uploadsDir)) {
    return res.json({
      success: true,
      count: 0,
      data: [],
    });
  }

  const files = fs
    .readdirSync(env.uploadsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && IMAGE_FILE_REGEX.test(entry.name))
    .map((entry) => {
      const absolutePath = path.join(env.uploadsDir, entry.name);
      const stats = fs.statSync(absolutePath);

      return {
        id: entry.name,
        filename: entry.name,
        url: buildFileUrl(req, entry.name),
        thumbnail: buildFileUrl(req, entry.name),
        source: 'upload',
        createdAt: stats.mtimeMs || stats.ctimeMs || 0,
      };
    })
    .filter((file) => !query || file.filename.toLowerCase().includes(query))
    .sort((first, second) => second.createdAt - first.createdAt)
    .slice(0, 60);

  return res.json({
    success: true,
    count: files.length,
    data: files,
  });
}

module.exports = {
  uploadFile,
  listUploadedFiles,
};
