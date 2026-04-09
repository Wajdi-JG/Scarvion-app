import React, { useEffect, useState } from 'react';
import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  BlockStack,
  Banner,
} from '@shopify/polaris';
import { ExternalSmallMinor } from '@shopify/polaris-icons';
import { useSessionToken } from './hooks/useSessionToken';

export default function Dashboard() {
  const SCARVION_FORM_URL = 'https://link.scarvion.com/widget/form/8phmaAmz1MG7scTZzXDB';
  const API_BASE = process.env.REACT_APP_API_BASE ?? '';

  // App Bridge session token setup
  const { fetchWithToken } = useSessionToken();
  const [sessionError, setSessionError] = useState(null);

  useEffect(() => {
    // Verify the session with the backend on mount.
    // fetchWithToken automatically injects Authorization: Bearer <token>.
    fetchWithToken(`${API_BASE}/api/session`)
      .then((res) => {
        if (!res.ok) throw new Error(`Session verification failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log('[Scarvion] Authenticated session:', data);
      })
      .catch((err) => {
        console.error('[Scarvion] Session error:', err);
        setSessionError(err.message);
      });
  }, [fetchWithToken, API_BASE]);

  const handleRedirect = () => {
    window.open(SCARVION_FORM_URL, '_blank');
  };

  return (
    <Page title="Scarvion">
      <Layout>
        {sessionError && (
          <Layout.Section>
            <Banner tone="critical" title="Session authentication error">
              <p>{sessionError}</p>
            </Banner>
          </Layout.Section>
        )}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingLg" as="h1">
                Welcome to Scarvion
              </Text>
              <Text variant="headingMd" as="h2">
                Ecommerce store : Supercharge Your Growth with Scarvion AI Agents
              </Text>
              <Text>
                Automate sales, recover lost revenue, and deliver personalized shopping experiences — all in real time
              </Text>
              <Button
                variant="primary"
                icon={ExternalSmallMinor}
                onClick={handleRedirect}
              >
                Go to Scarvion Form
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
