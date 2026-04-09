import jwt from 'jsonwebtoken';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;

/**
 * Express middleware — validates incoming Shopify session tokens (JWT HS256).
 *
 * The frontend must pass the token in:
 *   Authorization: Bearer <session_token>
 *
 * Verification steps (per Shopify docs):
 *  1. Signature verified with HS256 + app secret
 *  2. `exp`  — token must not be expired
 *  3. `nbf`  — token must already be active
 *  4. `aud`  — must match the app's API key (client ID)
 *  5. `iss` / `dest` — top-level domains must match; `iss` must end with /admin
 *
 * On success, `req.shopify` is populated with the decoded payload.
 * On failure, responds with 401 Unauthorized.
 */
export function verifySessionToken(req, res, next) {
  const authHeader = req.headers.authorization ?? '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  if (!SHOPIFY_API_SECRET) {
    console.error('SHOPIFY_API_SECRET env variable is not set');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  let payload;
  try {
    // jsonwebtoken verifies exp and nbf automatically when clockTolerance is set
    payload = jwt.verify(token, SHOPIFY_API_SECRET, {
      algorithms: ['HS256'],
      clockTolerance: 10, // seconds — tolerate minor clock skew
    });
  } catch (err) {
    return res.status(401).json({ error: `Invalid session token: ${err.message}` });
  }

  // Validate audience matches our app's client ID
  if (SHOPIFY_API_KEY && payload.aud !== SHOPIFY_API_KEY) {
    return res.status(401).json({ error: 'Session token audience mismatch' });
  }

  // iss must end with /admin and share the same top-level domain as dest
  const iss = payload.iss ?? '';
  const dest = payload.dest ?? '';

  if (!iss.endsWith('/admin')) {
    return res.status(401).json({ error: 'Invalid iss claim' });
  }

  const issHost = new URL(`https://${iss.replace('/admin', '')}`).hostname;
  const destHost = new URL(dest.startsWith('http') ? dest : `https://${dest}`).hostname;

  if (issHost !== destHost) {
    return res.status(401).json({ error: 'iss and dest domain mismatch' });
  }

  // Attach decoded payload so downstream handlers can use it
  req.shopify = {
    shop: destHost,
    userId: payload.sub,
    sessionId: payload.sid,
  };

  next();
}
