# Scarvion Shopify App

## Architecture

```
scarvion-shopify-app/
├── backend/                  # Node.js + Express (Shopify OAuth + API)
│   ├── src/
│   │   ├── index.js          # Entry point
│   │   ├── auth.js           # Shopify OAuth flow
│   │   ├── middleware.js      # Session / HMAC verification
│   │   └── routes/
│   │       ├── install.js    # App install route
│   │       ├── callback.js   # OAuth callback
│   │       └── customers.js  # Fetch + share customers data
│   ├── .env.example
│   └── package.json
│
├── frontend/                 # React + Shopify Polaris
│   ├── src/
│   │   ├── App.jsx
│   │   └── Dashboard.jsx     # Main dashboard UI
│   └── package.json
│
└── README.md
```

## Flow

1. Merchant installs app from Shopify App Store
2. OAuth flow → Shopify grants access token
3. Dashboard loads with "Share Customers with Scarvion" button
4. Click → fetch customers via Shopify Admin API → redirect to https://scarvion.com/business-solution
