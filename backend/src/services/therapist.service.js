const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const ApiError = require('../utils/apiError');

function sanitizeTherapist(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function createTherapist(payload) {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
  });

  if (existingUser) {
    throw new ApiError(409, 'A therapist with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const therapist = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email.toLowerCase(),
      password: hashedPassword,
      role: 'THERAPIST',
      isActive: payload.isActive ?? true,
    },
  });

  return sanitizeTherapist(therapist);
}

async function listTherapists() {
  const therapists = await prisma.user.findMany({
    where: { role: 'THERAPIST' },
    orderBy: { createdAt: 'desc' },
  });

  return therapists.map(sanitizeTherapist);
}

async function updateTherapist(therapistId, payload) {
  const therapist = await prisma.user.findFirst({
    where: { id: therapistId, role: 'THERAPIST' },
  });

  if (!therapist) {
    throw new ApiError(404, 'Therapist not found.');
  }

  if (payload.email && payload.email.toLowerCase() !== therapist.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ApiError(409, 'Another user already uses this email.');
    }
  }

  const data = {
    name: payload.name ?? therapist.name,
    email: payload.email ? payload.email.toLowerCase() : therapist.email,
    isActive: payload.isActive ?? therapist.isActive,
  };

  if (payload.password) {
    data.password = await bcrypt.hash(payload.password, 10);
  }

  const updated = await prisma.user.update({
    where: { id: therapistId },
    data,
  });

  return sanitizeTherapist(updated);
}

async function deactivateTherapist(therapistId) {
  const therapist = await prisma.user.findFirst({
    where: { id: therapistId, role: 'THERAPIST' },
  });

  if (!therapist) {
    throw new ApiError(404, 'Therapist not found.');
  }

  const updated = await prisma.user.update({
    where: { id: therapistId },
    data: { isActive: false },
  });

  return sanitizeTherapist(updated);
}

module.exports = {
  createTherapist,
  listTherapists,
  updateTherapist,
  deactivateTherapist,
};
