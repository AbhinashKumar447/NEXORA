const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const studyHelpRoutes = require('./routes/studyHelpRoutes');

const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(
	helmet({
		crossOriginResourcePolicy: { policy: 'cross-origin' },
	})
);

const corsOrigins = process.env.CORS_ORIGIN
	? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
	: null;

app.use(
	cors({
		origin:
			corsOrigins && corsOrigins.length
				? (origin, cb) => {
					if (!origin) return cb(null, true);
					if (corsOrigins.includes(origin)) return cb(null, true);
					if (
						process.env.NODE_ENV !== 'production' &&
						/^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
					)
						return cb(null, true);
					return cb(new Error('Not allowed by CORS'), false);
				}
				: '*',
		credentials: Boolean(corsOrigins && corsOrigins.length),
	})
);

app.use(
	rateLimit({
		windowMs: 15 * 60 * 1000,
		limit: Number(process.env.RATE_LIMIT_MAX || 300),
		standardHeaders: 'draft-7',
		legacyHeaders: false,
	})
);

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/study-help', studyHelpRoutes);

app.get('/health', (_req, res) => {
	res.status(200).json({ status: 'ok' });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;


