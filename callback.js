import { Router } from 'express';
import { shopify } from '../index.js';

export const callbackRouter = Router();

// In-memory token store (replace with DB in production: PostgreSQL, Redis, etc.)
export const tokenStore = new Map(); // { shop: accessToken }

/**
 * GET /auth/callback
 * Shopify redirects here after merchant approves the app.
 * We exchange the code for a permanent access token.
 */
callbackRouter.get('/', async (req, res) => {
  try {
    const callbackResponse = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    const { shop, accessToken } = callbackResponse.session;

    // Persist the access token
    tokenStore.set(shop, accessToken);
    console.log(`✅  Installed for shop: ${shop}`);

    // Save shop in session so the frontend can identify it
    req.session.shop = shop;

    // Redirect merchant to the embedded app dashboard
    const appUrl = `https://${shop}/admin/apps/${process.env.SHOPIFY_API_KEY}`;
    res.redirect(appUrl);
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.status(500).send('OAuth failed: ' + err.message);
  }
});
