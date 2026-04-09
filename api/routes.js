import express from 'express';
import { verifySessionToken } from '../middlewares/verifySessionToken.js';

const router = express.Router();

// All routes in this router are protected — verifySessionToken validates the
// `Authorization: Bearer <session_token>` header on every request.
router.use(verifySessionToken);

// Example protected route — returns the authenticated shop/user context.
// The frontend calls this with authenticatedFetch to confirm the session.
router.get('/session', (req, res) => {
  res.json({
    shop: req.shopify.shop,
    userId: req.shopify.userId,
    sessionId: req.shopify.sessionId,
  });
});

// Add additional authenticated API routes here, e.g.:
// router.get('/data', async (req, res) => { ... });

export default router;
