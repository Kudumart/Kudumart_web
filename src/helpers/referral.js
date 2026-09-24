import apiClient from "../api/apiFactory";

const STORAGE_KEY = "kuduReferralAttribution";

export const getReferralAttribution = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved?.referralCode || !saved?.referralVisitorToken) return {};
    if (saved.expiresAt && new Date(saved.expiresAt).getTime() <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return {};
    }
    return {
      referralCode: saved.referralCode,
      referralVisitorToken: saved.referralVisitorToken,
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return {};
  }
};

export const captureReferralFromUrl = async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("ref")?.trim().toUpperCase();
  if (!code) return null;

  const existing = getReferralAttribution();
  const response = await apiClient.post("/referrals/visits", {
    code,
    visitorToken: existing.referralVisitorToken || undefined,
    landingUrl: window.location.href,
    referrerUrl: document.referrer || undefined,
  });

  if (response.data?.valid && response.data?.data?.visitorToken) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        referralCode: code,
        referralVisitorToken: response.data.data.visitorToken,
        expiresAt: response.data.data.expiresAt,
      }),
    );
  }
  return response.data;
};

