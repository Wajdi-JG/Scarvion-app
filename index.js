import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';

import { installRouter } from './routes/install.js';
import { callbackRouter } from './routes/callback.js';
import { customersRouter } from './routes/customers.js';

// ─── Shopify client setup ─────────────────────────────────────────────────────
export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: process.env.HOST.replace(/https?:\/\//, ''),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
});

// ─── Express setup ────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', sameSite: 'none' },
  })
);

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Shopify OAuth install → /auth?shop=mystore.myshopify.com
app.use('/auth', installRouter);

// Shopify OAuth callback → /auth/callback
app.use('/auth/callback', callbackRouter);

// Customers API → /api/customers
app.use('/api/customers', customersRouter);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Scarvion Shopify backend running on port ${PORT}`);
  console.log(`    Install URL: ${process.env.HOST}/auth?shop=YOUR_STORE.myshopify.com`);
});
