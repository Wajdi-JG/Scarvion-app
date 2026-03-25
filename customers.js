import { Router } from 'express';
import { shopify } from '../index.js';
import { tokenStore } from './callback.js';

export const customersRouter = Router();

/**
 * POST /api/customers/share
 * Body: { shop: "mystore.myshopify.com" }
 *
 * 1. Fetch customers from Shopify Admin API (first 250)
 * 2. Return count + redirect URL to Scarvion
 */
customersRouter.post('/share', async (req, res) => {
  const { shop } = req.body;

  if (!shop) {
    return res.status(400).json({ error: 'Missing shop parameter' });
  }

  const accessToken = tokenStore.get(shop);
  if (!accessToken) {
    return res.status(401).json({ error: 'Shop not authenticated. Please reinstall the app.' });
  }

  try {
    // ── Fetch customers from Shopify REST Admin API ──────────────────────────
    const response = await fetch(
      `https://${shop}/admin/api/2024-01/customers.json?limit=250`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Shopify API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const customers = data.customers;

    // ── Map to a clean payload for Scarvion ─────────────────────────────────
    const payload = customers.map((c) => ({
      id: c.id,
      email: c.email,
      first_name: c.first_name,
      last_name: c.last_name,
      phone: c.phone,
      orders_count: c.orders_count,
      total_spent: c.total_spent,
      created_at: c.created_at,
      tags: c.tags,
    }));

    console.log(`📦  Sharing ${payload.length} customers from ${shop} with Scarvion`);

    // ── Optional: POST data to Scarvion backend ──────────────────────────────
    // Uncomment when Scarvion provides a webhook/API endpoint:
    //
    // await fetch('https://scarvion.com/api/receive-customers', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer YOUR_SECRET' },
    //   body: JSON.stringify({ shop, customers: payload }),
    // });

    return res.json({
      success: true,
      count: payload.length,
      redirectUrl: 'https://scarvion.com/business-solution',
      // Return payload so the frontend can show a preview (optional)
      preview: payload.slice(0, 3),
    });
  } catch (err) {
    console.error('Error sharing customers:', err);
    return res.status(500).json({ error: err.message });
  }
});
