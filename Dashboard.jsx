import React from 'react';
import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  BlockStack,
} from '@shopify/polaris';
import { ExternalSmallMinor } from '@shopify/polaris-icons';

export default function Dashboard() {
  const SCARVION_FORM_URL = 'https://link.scarvion.com/widget/form/8phmaAmz1MG7scTZzXDB';

  const handleRedirect = () => {
    window.open(SCARVION_FORM_URL, '_blank');
  };

  return (
    <Page title="Scarvion">
      <Layout>
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
