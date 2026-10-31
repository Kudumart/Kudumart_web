# KuduMart refined frontend parity checklist

This checklist records the refined frontend's functional coverage against the legacy web application. It is intended for release review on the `staging` branch.

## Public and customer experience

- [x] Homepage hero, search, categories, products, condition groups, services, auctions, adverts, careers, app call-to-action, and expanded footer
- [x] Product detail, social sharing metadata, store view, saved items, cart, delivery quote, product charges, checkout, and payment hand-off
- [x] Customer account, orders, offers, notifications, messages, service bookings, profile, and addresses
- [x] About, contact, FAQ, testimonials, privacy, terms, cookies, returns, and download-app pages
- [x] Careers list, job detail, résumé upload, and job application submission
- [x] Friendly not-found page and legacy URL aliases

## Seller experience

- [x] Seller onboarding and KYC review/correction states
- [x] Stores, ordinary and dropship products, auctions and bids, services and dynamic attributes, adverts, orders, offers, finance, subscriptions, and profile
- [x] Publishing limits and vendor/customer checkout guardrails

## Administration

- [x] Dashboard, customers, vendors, KYC, products, trending control, categories, stores, orders, payments, withdrawals, and subscriptions
- [x] Adverts, services, service taxonomy, service attributes, product charges, and marketplace configuration
- [x] Banner, testimonial, FAQ/category, careers, and contact-enquiry content management
- [x] Reports, notifications, access/team management, and governance tools
- [x] Dropship supplier/tracking monitor inside order detail
- [x] Auction lifecycle filtering, cancellation, bidder list, and dedicated auction monitor

## Verification gates

- [x] Static route and backend-contract parity tests
- [x] Full frontend unit test suite
- [x] Vite production build
- [x] All completed work committed and pushed to `origin/staging`

## Staging release smoke test

After Vercel deploys `staging`, sign in once as a customer, seller, and administrator. Confirm one successful read/write flow for checkout, KYC, seller publishing, content management, dropship tracking, and auction monitoring. These checks exercise live credentials and production-like data, so they remain the deployment operator's final acceptance gate rather than an automated local test.
