const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
  path: path.join(__dirname, '../../.env'),
});

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/speech_therapy_clinic?schema=public',
  jwtSecret: process.env.JWT_SECRET || 'replace-this-secret-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  superAdminName: process.env.SUPER_ADMIN_NAME || 'Clinic Super Admin',
  superAdminEmail: process.env.SUPER_ADMIN_EMAIL || 'admin@speech.local',
  superAdminPassword: process.env.SUPER_ADMIN_PASSWORD || '12345678',
  uploadsDir: path.join(__dirname, '../../uploads'),
  legacyDbPath: path.join(__dirname, '../../data/legacy-games.archive.json'),
  enableLegacyGameSeed: process.env.ENABLE_LEGACY_GAME_SEED === 'true',
  imageSearchProvider: process.env.IMAGE_SEARCH_PROVIDER || 'pexels',
  pexelsApiKey: process.env.PEXELS_API_KEY || '',
  pixabayApiKey: process.env.PIXABAY_API_KEY || '',
};
