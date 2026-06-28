import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { initializeDatabase } from './db/schema.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import universeRoutes from './routes/universes.js';
import articleRoutes from './routes/articles.js';
import characterRoutes from './routes/characters.js';
import categoryRoutes from './routes/categories.js';
import tagRoutes from './routes/tags.js';
import theoryRoutes from './routes/theories.js';
import commentRoutes from './routes/comments.js';
import searchRoutes from './routes/search.js';
import homeRoutes from './routes/home.js';
import adminRoutes from './routes/admin.js';
import healthRoutes from './routes/health.js';
import { circuitBreaker } from './middleware/circuitBreaker.js';

initializeDatabase();

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');

app.set('trust proxy', 1);

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:4321,http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  hsts: IS_PRODUCTION ? { maxAge: 31_536_000, includeSubDomains: true, preload: true } : false,
}));
app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.use('/api', circuitBreaker);
app.use('/api', generalLimiter);

// ── Health (sin circuit breaker) ──
app.use('/api/health', healthRoutes);

// ── Public routes ──
app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/universes', universeRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/theories', theoryRoutes);
app.use('/api', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 NexoGeek API server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  if (IS_PRODUCTION) {
    console.log(`🔒 Production mode: CORS=${corsOrigins.join(',')}`);
  }
});

export default app;
