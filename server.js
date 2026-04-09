import express from 'express';
import cors from 'cors';
import apiRoutes from './api/routes.js';
import webhookRoutes from './webhooks/router.js';

const app = express();
// Render injects PORT automatically; fallback to 3000 for local dev
const PORT = process.env.PORT || 3000;

// Capture raw body for Shopify HMAC verification before JSON parsing
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(cors());

// Health check — required by Render to confirm the service is up
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Compliance webhooks (HMAC-verified, no session token)
app.use('/webhooks', webhookRoutes);

// Authenticated API routes (session token required)
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
