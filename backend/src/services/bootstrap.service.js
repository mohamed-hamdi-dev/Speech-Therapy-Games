const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const env = require('../config/env');

async function ensureUploadsDirectory() {
  if (!fs.existsSync(env.uploadsDir)) {
    fs.mkdirSync(env.uploadsDir, { recursive: true });
  }
}

async function ensureSuperAdmin() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: env.superAdminEmail.toLowerCase() },
  });

  if (existingAdmin) {
    return existingAdmin;
  }

  const password = await bcrypt.hash(env.superAdminPassword, 10);
  return prisma.user.create({
    data: {
      name: env.superAdminName,
      email: env.superAdminEmail.toLowerCase(),
      password,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
}

function mapLegacyGame(legacyGame) {
  return {
    name: legacyGame.name || legacyGame.title || 'Untitled Game',
    title: legacyGame.title || legacyGame.name || null,
    titleAr: legacyGame.titleAr || legacyGame.nameAr || null,
    type: legacyGame.type,
    level: legacyGame.level || 1,
    isActive: true,
    questionText: legacyGame.questionText || null,
    questionTextAr: legacyGame.questionTextAr || null,
    questionAudio: legacyGame.questionAudio || null,
    instructionText: legacyGame.instructionText || null,
    instructionTextAr: legacyGame.instructionTextAr || null,
    instructionAudio: legacyGame.instructionAudio || null,
    targetImage: legacyGame.targetImage || null,
    options: legacyGame.options || null,
    items: legacyGame.items || null,
    successSound: legacyGame.successSound || null,
    failSound: legacyGame.failSound || null,
  };
}

async function seedLegacyGames() {
  const count = await prisma.game.count();

  if (count > 0 || !fs.existsSync(env.legacyDbPath)) {
    return;
  }

  const raw = fs.readFileSync(env.legacyDbPath, 'utf-8');
  const parsed = JSON.parse(raw);
  const legacyGames = Array.isArray(parsed.games) ? parsed.games : [];

  if (!legacyGames.length) {
    return;
  }

  await prisma.game.createMany({
    data: legacyGames.map(mapLegacyGame),
  });
}

async function bootstrapApplication() {
  await ensureUploadsDirectory();
  await ensureSuperAdmin();
  await seedLegacyGames();
}

module.exports = {
  bootstrapApplication,
};
