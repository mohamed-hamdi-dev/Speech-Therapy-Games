const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/prisma');
const { bootstrapApplication } = require('./services/bootstrap.service');

async function startServer() {
  try {
    await prisma.$connect();
    await bootstrapApplication();

    app.listen(env.port, () => {
      console.log(`Backend server running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start backend:', error);
    process.exit(1);
  }
}

startServer();
