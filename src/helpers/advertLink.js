// Resolves where a clicked advert should send the user. Adverts can target a
// specific product, a specific category, or fall back to a vendor-configured
// "Advert Link" (which itself might be an internal path — e.g. a vendor's own
// store page — or an external URL). Centralized here so every ad placement
// (homepage promotions, trending section, etc.) redirects consistently
// instead of each component re-deriving its own (previously missing) logic.
export function resolveAdvertDestination(ad) {
  if (!ad) return null;

  if (ad.productId) {
    return { type: "internal", path: `/product/${ad.productId}` };
  }

  if (ad.categoryId && ad.sub_category?.category?.id) {
    const { category, name: subCategoryName } = ad.sub_category;
    const params = subCategoryName
      ? `?subCategory=${encodeURIComponent(subCategoryName)}`
      : "";
    return {
      type: "internal",
      path: `/products/categories/${category.id}/${encodeURIComponent(category.name)}${params}`,
    };
  }

  if (ad.link) {
    const link = ad.link.trim();
    const isAbsolute = /^https?:\/\//i.test(link);

    if (isAbsolute) {
      const isSameHost =
        typeof window !== "undefined" && link.includes(window.location.host);

      if (isSameHost) {
        // Strip the origin so react-router handles it as an internal navigation.
        return { type: "internal", path: link.replace(/^https?:\/\/[^/]+/i, "") || "/" };
      }
      return { type: "external", url: link };
    }

    // Relative path configured by the vendor/admin (e.g. "/store/123/products").
    return { type: "internal", path: link.startsWith("/") ? link : `/${link}` };
  }

  return null;
}

export function goToAdvert(ad, navigate) {
  const destination = resolveAdvertDestination(ad);
  if (!destination) return;

  if (destination.type === "external") {
    window.open(destination.url, "_blank", "noopener,noreferrer");
  } else {
    navigate(destination.path);
  }
}
