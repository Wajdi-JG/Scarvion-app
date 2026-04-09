import express from 'express';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3000;
const SHOPIFY_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

// Parse raw body for HMAC verification BEFORE json middleware
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

/**
 * Verify that the request comes from Shopify using HMAC-SHA256.
 * Returns 401 if the signature is missing or invalid.
 */
function verifyShopifyHmac(req, res, next) {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');

  if (!hmacHeader) {
    return res.status(401).json({ error: 'Missing HMAC header' });
  }

  if (!SHOPIFY_SECRET) {
    console.error('SHOPIFY_WEBHOOK_SECRET env variable is not set');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  const digest = crypto
    .createHmac('sha256', SHOPIFY_SECRET)
    .update(req.rawBody)
    .digest('base64');

  // Use timingSafeEqual to prevent timing attacks
  const digestBuffer = Buffer.from(digest);
  const hmacBuffer = Buffer.from(hmacHeader);

  if (
    digestBuffer.length !== hmacBuffer.length ||
    !crypto.timingSafeEqual(digestBuffer, hmacBuffer)
  ) {
    return res.status(401).json({ error: 'Invalid HMAC signature' });
  }

  next();
}

// ─── customers/data_request ──────────────────────────────────────────────────
// Triggered when a customer requests their data from a store owner.
// Payload: { shop_id, shop_domain, orders_requested[], customer: { id, email, phone }, data_request: { id } }
app.post('/webhooks/customers/data_request', verifyShopifyHmac, (req, res) => {
  const { shop_id, shop_domain, customer, orders_requested, data_request } = req.body;

  console.log(`[customers/data_request] shop=${shop_domain} (${shop_id})`);
  console.log(`  Customer: id=${customer?.id}, email=${customer?.email}`);
  console.log(`  Orders requested: ${orders_requested?.join(', ')}`);
  console.log(`  Data request id: ${data_request?.id}`);

  // TODO: Retrieve the data associated with `customer.id` / `orders_requested`
  // and send it to the store owner within 30 days.

  res.status(200).json({ received: true });
});

// ─── customers/redact ────────────────────────────────────────────────────────
// Triggered when a store owner requests deletion of a customer's data.
// Payload: { shop_id, shop_domain, customer: { id, email, phone }, orders_to_redact[] }
app.post('/webhooks/customers/redact', verifyShopifyHmac, (req, res) => {
  const { shop_id, shop_domain, customer, orders_to_redact } = req.body;

  console.log(`[customers/redact] shop=${shop_domain} (${shop_id})`);
  console.log(`  Customer: id=${customer?.id}, email=${customer?.email}`);
  console.log(`  Orders to redact: ${orders_to_redact?.join(', ')}`);

  // TODO: Delete / anonymise all data linked to `customer.id` and
  // `orders_to_redact` within 30 days (unless legally required to retain it).

  res.status(200).json({ received: true });
});

// ─── shop/redact ─────────────────────────────────────────────────────────────
// Triggered 48 hours after a store owner uninstalls the app.
// Payload: { shop_id, shop_domain }
app.post('/webhooks/shop/redact', verifyShopifyHmac, (req, res) => {
  const { shop_id, shop_domain } = req.body;

  console.log(`[shop/redact] shop=${shop_domain} (${shop_id})`);

  // TODO: Delete all data you hold for this shop within 30 days.

  res.status(200).json({ received: true });
});

app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});
