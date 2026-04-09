import { useMemo } from 'react';
import createApp from '@shopify/app-bridge';
import { getSessionToken, authenticatedFetch } from '@shopify/app-bridge/utilities';

/**
 * Initialises Shopify App Bridge and returns:
 *  - `fetchWithToken(url, options)` — a fetch wrapper that automatically
 *    attaches a fresh `Authorization: Bearer <session_token>` header.
 *
 * Usage:
 *   const { fetchWithToken } = useSessionToken();
 *   const data = await fetchWithToken('/api/session').then(r => r.json());
 *
 * The `host` parameter is read from the URL query string as required by
 * App Bridge. The `apiKey` is the app's Shopify API key (client ID).
 */
export function useSessionToken() {
  const app = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const host = params.get('host') ?? '';

    return createApp({
      apiKey: process.env.REACT_APP_SHOPIFY_API_KEY ?? '',
      host,
      forceRedirect: true,
    });
  }, []);

  // authenticatedFetch wraps the native fetch and injects the session token
  const fetchWithToken = useMemo(() => authenticatedFetch(app), [app]);

  // Manual helper for cases where only the raw token is needed
  const getToken = () => getSessionToken(app);

  return { app, fetchWithToken, getToken };
}
