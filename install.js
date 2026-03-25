import { Router } from 'express';
import { shopify } from '../index.js';

export const installRouter = Router();

/**
 * GET /auth?shop=mystore.myshopify.com
 * Initiates the Shopify OAuth flow.
 * Shopify will redirect the merchant here after clicking "Install".
 */
installRouter.get('/', async (req, res) => {
  const shop = req.query.shop;

  if (!shop) {
    return res.status(400).send('Missing ?shop parameter');
  }

  // Build the OAuth URL and redirect merchant to Shopify consent screen
  await shopify.auth.begin({
    shop: shopify.utils.sanitizeShop(shop, true),
    callbackPath: '/auth/callback',
    isOnline: false, // offline token = permanent access
    rawRequest: req,
    rawResponse: res,
  });
});
