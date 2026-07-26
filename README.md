# Project Checkout Cart

Stripe-inspired checkout demo built with React + Vite.

## Live Site (GitHub Pages)

After Actions deploy, this is hosted at:

`https://wats3082.github.io/Project-Checkout-Cart/`

## What this version includes

- Modern React frontend checkout experience
- Dummy product data and simulated payment confirmation
- Clean separation between UI and checkout service layer
- Ready path for future AWS backend integration

## AWS backend roadmap (next phase)

1. API Gateway endpoint for checkout sessions
2. Lambda service for cart validation and pricing
3. DynamoDB order/session persistence
4. Stripe Checkout Session + webhook processing
5. EventBridge/SQS for async fulfillment workflows

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```