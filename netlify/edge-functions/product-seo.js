const API_BASE = "https://api.kudumart.com/api";
const SITE_ORIGIN = "https://kudumart.com";
const DEFAULT_IMAGE = `${SITE_ORIGIN}/kudumart-mark.png`;

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripHtml(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function safeJsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

function effectivePrice(product) {
  const base = Number(product?.price) || 0;
  const discount = Number(product?.discount_price) || 0;
  if (discount > 0 && (base <= 0 || discount < base)) return discount;
  return base;
}

export default async function handler(request, context) {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/product\/([^/]+)\/?$/);
  if (!match) {
    return context.next();
  }

  const productId = decodeURIComponent(match[1]);
  if (!productId || productId.includes(".")) {
    return context.next();
  }

  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  let apiRes;
  try {
    apiRes = await fetch(
      `${API_BASE}/product?productId=${encodeURIComponent(productId)}`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(4000),
      },
    );
  } catch {
    // Fail open if the API is unreachable or slow so real shoppers aren't impacted.
    return response;
  }

  const html = await response.text();

  // If the product truly does not exist, return a real HTTP 404 + noindex so Google never flags a Soft 404.
  if (apiRes.status === 404) {
    const notFoundHead = [
      `<meta name="robots" content="noindex, nofollow" />`,
      `<meta name="googlebot" content="noindex, nofollow" />`,
    ].join("");

    const updatedHtml = html
      .replace(/<title>.*?<\/title>/i, "<title>Product Unavailable | KuduMart</title>")
      .replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="description" content="This product could not be found or is no longer available on KuduMart." />`,
      )
      .replace("</head>", `${notFoundHead}</head>`);

    const headers = new Headers(response.headers);
    headers.set("content-type", "text/html; charset=UTF-8");
    headers.set("x-robots-tag", "noindex, nofollow");
    return new Response(updatedHtml, { status: 404, headers });
  }

  if (!apiRes.ok) {
    return new Response(html, { status: response.status, headers: response.headers });
  }

  let payload;
  try {
    payload = await apiRes.json();
  } catch {
    return new Response(html, { status: response.status, headers: response.headers });
  }

  const product = payload?.data || payload?.product || null;
  if (!product || !product.id) {
    const notFoundHead = [
      `<meta name="robots" content="noindex, nofollow" />`,
      `<meta name="googlebot" content="noindex, nofollow" />`,
    ].join("");

    const updatedHtml = html
      .replace(/<title>.*?<\/title>/i, "<title>Product Unavailable | KuduMart</title>")
      .replace("</head>", `${notFoundHead}</head>`);

    const headers = new Headers(response.headers);
    headers.set("content-type", "text/html; charset=UTF-8");
    headers.set("x-robots-tag", "noindex, nofollow");
    return new Response(updatedHtml, { status: 404, headers });
  }

  const name = product.name || "Product";
  const plainDesc = stripHtml(product.description);
  const metaDesc = (
    plainDesc ||
    `Buy ${name} online at KuduMart Nigeria. Verified sellers, fast delivery, and secure checkout.`
  ).slice(0, 160);
  const fullDesc =
    plainDesc && plainDesc.length >= 40
      ? plainDesc
      : `${plainDesc ? `${plainDesc}. ` : ""}Order ${name} online from ${
          product.store?.name || "verified sellers"
        } on KuduMart Nigeria with secure checkout and nationwide delivery.`;

  const price = effectivePrice(product);
  const currencyCode = product.store?.currency?.code || "NGN";
  const currencySymbol = product.store?.currency?.symbol || "₦";
  const formattedPrice =
    price > 0 ? `${currencySymbol}${price.toLocaleString("en-NG")}` : "";
  const inStock = Number(product.quantity) > 0;
  const storeName =
    product.store?.name || product.vendor?.businessName || "KuduMart";
  const categoryName =
    product.category?.name || product.sub_category?.name || "Marketplace";
  const image =
    product.image_url ||
    (Array.isArray(product.additional_images) && product.additional_images[0]) ||
    DEFAULT_IMAGE;
  const canonicalUrl = `${SITE_ORIGIN}/product/${encodeURIComponent(product.id)}`;
  const pageTitle = `${name} — Buy Online | KuduMart`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: metaDesc,
    image: [
      image,
      ...(Array.isArray(product.additional_images)
        ? product.additional_images.filter((img) => img && img !== image)
        : []),
    ],
    sku: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: storeName,
    },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: currencyCode,
      price: String(price),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: storeName,
      },
    },
  };

  const seoTags = [
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />`,
    `<meta property="og:type" content="product" />`,
    `<meta property="og:site_name" content="KuduMart" />`,
    `<meta property="og:title" content="${escapeHtml(pageTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(metaDesc)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    price > 0
      ? `<meta property="product:price:amount" content="${escapeHtml(price)}" />`
      : "",
    `<meta property="product:price:currency" content="${escapeHtml(currencyCode)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(pageTitle)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(metaDesc)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
    `<script type="application/ld+json">${safeJsonLd(jsonLd)}</script>`,
  ]
    .filter(Boolean)
    .join("");

  // Semantic initial content inside #root so Googlebot never sees an empty shell;
  // React's createRoot().render() immediately replaces this on the client.
  const initialBody = [
    `<main style="max-width:960px;margin:2rem auto;padding:1rem;font-family:system-ui,sans-serif">`,
    `<h1>${escapeHtml(name)}</h1>`,
    formattedPrice ? `<p><strong>${escapeHtml(formattedPrice)}</strong></p>` : "",
    `<p>Category: ${escapeHtml(categoryName)} &middot; Seller: ${escapeHtml(storeName)} &middot; ${
      inStock ? "In Stock" : "Out of Stock"
    }</p>`,
    `<img src="${escapeHtml(image)}" alt="${escapeHtml(name)}" style="max-width:480px;height:auto" />`,
    `<article><p>${escapeHtml(fullDesc)}</p></article>`,
    `</main>`,
  ]
    .filter(Boolean)
    .join("");

  const updatedHtml = html
    .replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(pageTitle)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${escapeHtml(metaDesc)}" />`,
    )
    .replace("</head>", `${seoTags}</head>`)
    .replace('<div id="root"></div>', `<div id="root">${initialBody}</div>`);

  const headers = new Headers(response.headers);
  headers.set("content-type", "text/html; charset=UTF-8");
  headers.set("cache-control", "public, max-age=0, must-revalidate");
  return new Response(updatedHtml, { status: 200, headers });
}
