const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const env = require('./config/env');
const swaggerSpec = require('./docs/swagger');
const authRoutes = require('./routes/auth.routes');
const therapistRoutes = require('./routes/therapist.routes');
const studentRoutes = require('./routes/student.routes');
const gameRoutes = require('./routes/game.routes');
const imageRoutes = require('./routes/image.routes');
const sessionRoutes = require('./routes/session.routes');
const reportRoutes = require('./routes/report.routes');
const uploadRoutes = require('./routes/upload.routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(cors({ origin: '*' }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(env.uploadsDir));

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Speech Therapy Clinic API is running.',
  });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(authRoutes);
app.use(therapistRoutes);
app.use(studentRoutes);
app.use(gameRoutes);
app.use(imageRoutes);
app.use(sessionRoutes);
app.use(reportRoutes);
app.use(uploadRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
