const AMAZON_HOST_REGEX =
  /^([a-z0-9-]+\.)?amazon\.(com|co\.uk|ca|de|fr|it|es|co\.jp|com\.au|com\.br|com\.mx|in|nl|sg|ae|sa|se|pl|com\.tr)$/i;

const PRODUCT_PATH_REGEX = /\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?:[/?]|$)/i;

// Amazon's own URL-shortener domains, used for app/social share links
// like https://amzn.in/d/04EuPCCs. These redirect to a real amazon.*
// product page and must be resolved before they can be validated.
const SHORT_LINK_HOSTS = new Set(["amzn.to", "amzn.in", "amzn.eu", "amzn.asia", "a.co"]);

function isHttpUrl(parsed) {
  return parsed.protocol === "http:" || parsed.protocol === "https:";
}

function validateProductPage(parsed) {
  if (!AMAZON_HOST_REGEX.test(parsed.hostname)) {
    return { valid: false, reason: "URL must be an amazon.* domain" };
  }

  const match = parsed.pathname.match(PRODUCT_PATH_REGEX);

  if (!match) {
    return {
      valid: false,
      reason: "URL must be an Amazon product detail page (/dp/... or /gp/product/...)",
    };
  }

  return { valid: true, asin: match[1].toUpperCase(), url: parsed.toString() };
}

// Amazon's shortener ignores HEAD (returns 404) and requires a browser-like
// User-Agent, so resolution needs a real GET - the body is discarded unread.
async function resolveShortLink(url) {
  const response = await fetch(url, {
    method: "GET",
    redirect: "follow",
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(8000),
  });

  if (response.body) {
    try {
      await response.body.cancel();
    } catch {
      // ignore - we only need the final resolved URL
    }
  }

  return response.url;
}

// Only allow http(s) URLs pointing at a real Amazon product detail page
// (e.g. /dp/ASIN or /gp/product/ASIN) - rejects other Amazon pages
// (search, cart, account, etc.) and any non-Amazon host. Known Amazon
// share short links are resolved to their real destination first, then
// validated the same way.
export async function validateAmazonProductUrl(rawUrl) {
  let parsed;

  try {
    parsed = new URL(rawUrl);
  } catch {
    return { valid: false, reason: "Not a valid URL" };
  }

  if (!isHttpUrl(parsed)) {
    return { valid: false, reason: "URL must use http or https" };
  }

  if (!SHORT_LINK_HOSTS.has(parsed.hostname.toLowerCase())) {
    return validateProductPage(parsed);
  }

  let resolvedUrl;

  try {
    resolvedUrl = await resolveShortLink(parsed.toString());
  } catch {
    return { valid: false, reason: "Could not resolve Amazon short link" };
  }

  let resolvedParsed;

  try {
    resolvedParsed = new URL(resolvedUrl);
  } catch {
    return { valid: false, reason: "Short link resolved to an invalid URL" };
  }

  if (!isHttpUrl(resolvedParsed)) {
    return { valid: false, reason: "Short link resolved to a non-http(s) URL" };
  }

  return validateProductPage(resolvedParsed);
}
