# KuduMart next frontend

A separate React + Vite frontend for KuduMart. The design and components are new; endpoint behavior was referenced from the existing frontend.

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` to configure the API URL and test payment public keys. The API default is `https://api.kudumart.com/api`. Run `npm test` for checkout calculations and `npm run build` for a production bundle.

## Implemented

- Responsive storefront, catalog, category filters, search, product details, auction and service discovery.
- Customer and vendor registration, sign in, account landing page, saved products, and cart operations.
- Checkout review, delivery address form, naira charge and delivery quote, Stripe dollar quote, Paystack and Stripe test payment integrations, order history and details.
- Reusable button with scale animation, modal, toast, fields, badges, skeletons, empty states, and product cards.
- Centralized API client and feature API files with abortable page fetching and shared account/country state.
- Primary orange `#f36b31`, secondary navy `#172642`, and the official KuduMart logo.

## Payment activation

The local `.env` contains the previous project's **test public keys** but `VITE_ENABLE_TEST_PAYMENTS=false`. Payment controls are gated until a non-production customer account can complete an authenticated end-to-end test. See [checkout contract](docs/checkout-contract.md) for payloads, verification steps, and the confirmation retry behavior. Do not enable live keys solely from the frontend.

## Remaining migration

Auction bidding, service booking, seller workspace, and admin workspace need dedicated implementation. Their routes should be added with complete user flows and permissions. The new project does not import from the old source tree.
