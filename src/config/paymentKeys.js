const LIVE_STRIPE_PUBLIC_KEY =
  "pk_live_51QpXKW05R753b5a5lrZFiFkSIgZ5tN1GDe54P63gV68Or7CP1OWg30YdwG3r8cySsVq908EZ87L1VOEgarHEDkIU008RDAGzRL";
const stripeKey = import.meta.env.VITE_STRIPE_KEY || LIVE_STRIPE_PUBLIC_KEY;
const paystackKey = import.meta.env.VITE_PAYSTACK_KEY;
const testKey = import.meta.env.VITE_STRIPE_TEST || stripeKey;
export { paystackKey, stripeKey, testKey, LIVE_STRIPE_PUBLIC_KEY };
