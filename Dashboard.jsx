import React, { useState } from 'react';
import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  Banner,
  Badge,
  BlockStack,
  InlineStack,
  Spinner,
  Divider,
  Box,
} from '@shopify/polaris';
import { ShareMinor, ExternalSmallMinor } from '@shopify/polaris-icons';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function Dashboard({ shop }) {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleShare = async () => {
    setStatus('loading');
    setResult(null);
    setErrorMsg('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/customers/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Unknown error');
      }

      setResult(data);
      setStatus('success');

      // Auto-redirect to Scarvion after 2s
      setTimeout(() => {
        window.open(data.redirectUrl, '_blank');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  return (
    <Page
      title="Scarvion Integration"
      subtitle="Share your customer data with Scarvion to unlock smart business insights"
      titleMetadata={<Badge tone="success">Connected</Badge>}
    >
      <Layout>
        {/* ── Status banners ── */}
        {status === 'success' && result && (
          <Layout.Section>
            <Banner
              title={`${result.count} customers shared successfully`}
              tone="success"
              action={{
                content: 'Go to Scarvion',
                icon: ExternalSmallMinor,
                onAction: () => window.open(result.redirectUrl, '_blank'),
              }}
            >
              <Text as="p" variant="bodyMd">
                Redirecting you to Scarvion automatically…
              </Text>
            </Banner>
          </Layout.Section>
        )}

        {status === 'error' && (
          <Layout.Section>
            <Banner title="Something went wrong" tone="critical">
              <Text as="p" variant="bodyMd">{errorMsg}</Text>
            </Banner>
          </Layout.Section>
        )}

        {/* ── Main action card ── */}
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              {/* Header */}
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <Text variant="headingMd" as="h2">
                    Customer Data Sharing
                  </Text>
                  <Text variant="bodyMd" tone="subdued" as="p">
                    Export your Shopify customers to Scarvion to enable advanced
                    segmentation, loyalty features, and business analytics.
                  </Text>
                </BlockStack>

                {/* Scarvion logo placeholder */}
                <Box
                  background="bg-surface-secondary"
                  borderRadius="200"
                  padding="300"
                >
                  <Text variant="headingLg" as="span" fontWeight="bold">
                    S
                  </Text>
                </Box>
              </InlineStack>

              <Divider />

              {/* What gets shared */}
              <BlockStack gap="200">
                <Text variant="headingSm" as="h3">
                  What will be shared
                </Text>
                <BlockStack gap="100">
                  {[
                    'Customer name & email',
                    'Phone number',
                    'Order count & total spent',
                    'Account creation date',
                    'Customer tags',
                  ].map((item) => (
                    <InlineStack key={item} gap="200" blockAlign="center">
                      <Badge tone="success">✓</Badge>
                      <Text variant="bodyMd" as="span">{item}</Text>
                    </InlineStack>
                  ))}
                </BlockStack>
              </BlockStack>

              <Divider />

              {/* CTA */}
              <InlineStack align="end" gap="300">
                {status === 'loading' && (
                  <InlineStack gap="200" blockAlign="center">
                    <Spinner size="small" />
                    <Text variant="bodyMd" tone="subdued">Fetching customers…</Text>
                  </InlineStack>
                )}

                <Button
                  variant="primary"
                  size="large"
                  icon={ShareMinor}
                  loading={status === 'loading'}
                  disabled={status === 'success'}
                  onClick={handleShare}
                >
                  {status === 'success'
                    ? 'Shared!'
                    : 'Share Customers with Scarvion'}
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* ── Info section ── */}
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h2">
                Why Scarvion?
              </Text>
              <Text variant="bodyMd" tone="subdued" as="p">
                Scarvion provides intelligent business solutions to help you grow
                your customer base, improve retention, and increase revenue.
              </Text>
              <Button
                variant="plain"
                icon={ExternalSmallMinor}
                url="https://scarvion.com/business-solution"
                external
              >
                Learn more about Scarvion
              </Button>
            </BlockStack>
          </Card>

          <Box paddingBlockStart="400">
            <Card>
              <BlockStack gap="200">
                <Text variant="headingMd" as="h2">Your store</Text>
                <Text variant="bodyMd" tone="subdued" as="p">
                  {shop || 'Not detected'}
                </Text>
                <Badge tone="success">App installed</Badge>
              </BlockStack>
            </Card>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
