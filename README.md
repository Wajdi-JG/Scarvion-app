# Scarvion App

Simple Express app that redirects to a Scarvion form.

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and update as needed:
```bash
cp .env.example .env
```

## Running

```bash
npm start
```

The app will start on `http://localhost:3000`

## Endpoints

- `GET /` - Health check
- `GET /health` - Health check (JSON)
- `GET /api/customers/redirect` - Redirect to Scarvion form

## Deployment

Deploy to Render or any Node.js hosting provider.
