const prisma = require('../config/prisma');
const ApiError = require('../utils/apiError');

async function listGames() {
  return prisma.game.findMany({
    orderBy: [{ level: 'asc' }, { createdAt: 'asc' }],
  });
}

async function getGameById(gameId) {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
  });

  if (!game) {
    throw new ApiError(404, 'Game not found.');
  }

  return game;
}

async function createGame(payload) {
  return prisma.game.create({
    data: {
      name: payload.name || payload.title,
      title: payload.title || payload.name || null,
      titleAr: payload.titleAr || null,
      type: payload.type,
      level: payload.level,
      isActive: payload.isActive ?? true,
      questionText: payload.questionText || null,
      questionTextAr: payload.questionTextAr || null,
      questionAudio: payload.questionAudio || null,
      instructionText: payload.instructionText || null,
      instructionTextAr: payload.instructionTextAr || null,
      instructionAudio: payload.instructionAudio || null,
      targetImage: payload.targetImage || null,
      options: payload.options || null,
      items: payload.items || null,
      successSound: payload.successSound || null,
      failSound: payload.failSound || null,
    },
  });
}

async function updateGame(gameId, payload) {
  await getGameById(gameId);

  return prisma.game.update({
    where: { id: gameId },
    data: {
      name: payload.name || payload.title,
      title: payload.title || payload.name || null,
      titleAr: payload.titleAr || null,
      type: payload.type,
      level: payload.level,
      isActive: payload.isActive ?? true,
      questionText: payload.questionText || null,
      questionTextAr: payload.questionTextAr || null,
      questionAudio: payload.questionAudio || null,
      instructionText: payload.instructionText || null,
      instructionTextAr: payload.instructionTextAr || null,
      instructionAudio: payload.instructionAudio || null,
      targetImage: payload.targetImage || null,
      options: payload.options || null,
      items: payload.items || null,
      successSound: payload.successSound || null,
      failSound: payload.failSound || null,
    },
  });
}

async function deleteGame(gameId) {
  await getGameById(gameId);

  await prisma.game.delete({
    where: { id: gameId },
  });
}

module.exports = {
  listGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
};
