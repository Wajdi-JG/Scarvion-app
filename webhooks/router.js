import { Router } from 'express';
import crypto from 'crypto';

const router = Router();

function verifyShopifyHmac(req, res, next) {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');

  if (!hmacHeader) {
    return res.status(401).json({ error: 'Missing HMAC header' });
  }

  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('SHOPIFY_WEBHOOK_SECRET env variable is not set');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  const digest = crypto
    .createHmac('sha256', secret)
    .update(req.rawBody)
    .digest('base64');

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

// customers/data_request
router.post('/customers/data_request', verifyShopifyHmac, (req, res) => {
  const { shop_id, shop_domain, customer, orders_requested, data_request } = req.body;
  console.log(`[customers/data_request] shop=${shop_domain} (${shop_id})`);
  console.log(`  Customer: id=${customer?.id}, email=${customer?.email}`);
  console.log(`  Orders requested: ${orders_requested?.join(', ')}`);
  console.log(`  Data request id: ${data_request?.id}`);
  // TODO: envoyer les données au store owner dans les 30 jours
  res.status(200).json({ received: true });
});

// customers/redact
router.post('/customers/redact', verifyShopifyHmac, (req, res) => {
  const { shop_id, shop_domain, customer, orders_to_redact } = req.body;
  console.log(`[customers/redact] shop=${shop_domain} (${shop_id})`);
  console.log(`  Customer: id=${customer?.id}, email=${customer?.email}`);
  console.log(`  Orders to redact: ${orders_to_redact?.join(', ')}`);
  // TODO: supprimer / anonymiser les données dans les 30 jours
  res.status(200).json({ received: true });
});

// shop/redact
router.post('/shop/redact', verifyShopifyHmac, (req, res) => {
  const { shop_id, shop_domain } = req.body;
  console.log(`[shop/redact] shop=${shop_domain} (${shop_id})`);
  // TODO: supprimer toutes les données du shop dans les 30 jours
  res.status(200).json({ received: true });
});

export default router;
