# Buyer checkout contract

This maps the existing frontend's requests to the new project's `src/api/checkout.js`. The backend source was not available in this workspace; authenticated responses still need an end-to-end test with a non-production account.

## Address

- `GET /user/shipping/addresses?shipToCountryCode=NG|US|UK`: optional region suggestions. If unavailable, the form accepts state and city text.
- `PUT /user/profile/update`: sends `firstName`, `lastName`, `email`, and `location` with `country`, `state`, `city`, `street`, `zipCode`. The returned user replaces the current address in app state.

## Naira payment

- `GET /user/cart/charges`: product charge rules. The client calculates a review quote using the current cart. It supports fixed and percentage per-unit charges and discounts.
- `GET /user/delivery-fees?shipToCountryCode=NG`: delivery fee. Payment blocks if this or charges cannot be checked.
- Paystack test checkout receives the quote total in kobo. After the provider returns a reference, `POST /user/checkout` sends `refId`, `shippingAddress`, and `shippingAddressZipCode`.

The backend must verify the Paystack transaction and calculate the final amount from current cart data. The client quote is for display and must never be trusted as the order authority.

## Dollar payment

- `POST /user/checkout/dollar/prepare` with `shippingAddress` returns `clientSecret`, `id`, `totalAmount`, and `paymentBreakdown`. The UI uses this backend amount.
- Stripe Payment Element confirms the intent. After a `succeeded` status, `POST /user/checkout/dollar` receives the payment intent ID as `refId`, plus address details.

## After payment

- If a payment succeeds and order confirmation fails, the reference is retained in session storage. The checkout shows a retry for order confirmation and blocks a second payment.
- `GET /user/orders` lists the buyer's orders. `GET /user/order/items?orderId=` shows order items.

## Activation gate

`VITE_ENABLE_TEST_PAYMENTS` defaults to `false`. It must only be set to `true` with `pk_test_` keys. Before enabling it, use a non-production customer account to verify the address update, fee and charge response shapes, a naira test payment, a dollar test payment, order confirmation, and duplicate-reference handling. Do not enable live keys from this frontend alone.
