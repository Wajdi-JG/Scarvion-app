import React from 'react';
import { AppProvider } from '@shopify/polaris';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import en from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/build/esm/styles.css';
import Dashboard from './Dashboard';

// Read shop + host from URL params (injected by Shopify when loading embedded app)
const urlParams = new URLSearchParams(window.location.search);
const shop = urlParams.get('shop') || '';
const host = urlParams.get('host') || '';

const appBridgeConfig = {
  apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
  host,
  forceRedirect: true,
};

export default function App() {
  return (
    <AppBridgeProvider config={appBridgeConfig}>
      <AppProvider i18n={en}>
        <Dashboard shop={shop} />
      </AppProvider>
    </AppBridgeProvider>
  );
}
