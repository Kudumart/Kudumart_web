// Some product images were uploaded under an old/decommissioned host
// (e.g. a stale developer domain) and now fail to load outright — not just a
// mixed-content warning, the request errors with ERR_NAME_NOT_RESOLVED.
// This swaps in a neutral placeholder instead of a broken-image icon, and
// only swaps once (the `src` reassignment itself would otherwise re-trigger
// onError in a loop if the placeholder ever failed too).
export const FALLBACK_IMAGE = "https://picsum.photos/400/225";

export const handleImageError = (e) => {
  if (e.target.src !== FALLBACK_IMAGE) {
    e.target.src = FALLBACK_IMAGE;
  }
};
