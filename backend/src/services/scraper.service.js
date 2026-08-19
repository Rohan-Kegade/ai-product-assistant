import { chromium } from "playwright";

// BLOCK UNNECESSARY RESOURCES
async function optimizePage(page) {
  await page.route("**/*", async (route) => {
    const request = route.request();
    const type = request.resourceType();
    const url = request.url();

    // Block resources not required for text scraping
    if (
      type === "image" ||
      type === "font" ||
      type === "media" ||
      type === "stylesheet"
    ) {
      return route.abort();
    }

    // Block tracking / analytics / ads
    const blockedDomains = [
      "google-analytics",
      "googletagmanager",
      "doubleclick",
      "facebook.net",
      "amazon-adsystem",
      "advertising",
      "adservice",
      "scorecardresearch",
      "hotjar",
      "clarity.ms",
    ];

    if (blockedDomains.some((domain) => url.includes(domain))) {
      return route.abort();
    }

    return route.continue();
  });
}

// SCRAPE PRODUCT
export async function scrapeProduct(url) {
  const start = Date.now();

  // LAUNCH BROWSER
  const browser = await chromium.launch({
    headless: true,

    args: ["--disable-gpu", "--disable-dev-shm-usage", "--no-sandbox"],
  });

  try {
    // CREATE CONTEXT
    const context = await browser.newContext({
      viewport: {
        width: 1280,
        height: 800,
      },

      serviceWorkers: "block",
    });

    // CREATE PAGE
    const page = await context.newPage();

    await optimizePage(page);

    // LOAD AMAZON PAGE
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    // WAIT FOR PRODUCT TITLE
    try {
      await page.waitForSelector("#productTitle", {
        state: "attached",
        timeout: 5000,
      });
    } catch {
      console.log("Product title not found:", url);
    }

    // EXTRACT PRODUCT
    const product = await page.evaluate(() => {
      // TEXT HELPER
      const text = (selector) => {
        const element = document.querySelector(selector);

        return element?.innerText?.replace(/\s+/g, " ")?.trim() || null;
      };

      // ATTRIBUTE HELPER
      const attr = (selector, attribute) => {
        const element = document.querySelector(selector);

        return element?.getAttribute(attribute) || null;
      };

      // OFFERS
      const offers = Array.from(
        document.querySelectorAll(".vsx__offers .offers-items"),
      ).map((offer) => {
        const type =
          offer
            .querySelector(".offers-items-title")
            ?.innerText?.replace(/\s+/g, " ")
            ?.trim() || null;

        const description =
          offer
            .querySelector(".a-truncate-full")
            ?.innerText?.replace(/\s+/g, " ")
            ?.trim() || null;

        const count =
          offer
            .querySelector(".vsx-offers-count")
            ?.innerText?.replace(/\s+/g, " ")
            ?.trim() || null;

        return {
          type,
          description,
          count,
        };
      });

      // PRODUCT DETAILS
      const productDetails = {};

      document.querySelectorAll("#prodDetails tr").forEach((row) => {
        const key = row
          .querySelector("th")
          ?.innerText?.replace(/\s+/g, " ")
          ?.trim();

        const value = row
          .querySelector("td")
          ?.innerText?.replace(/\s+/g, " ")
          ?.trim();

        if (key && value && key !== "Customer Reviews") {
          productDetails[key] = value;
        }
      });

      // TECHNICAL DETAILS
      const techDetails = {};

      document.querySelectorAll("#tech table tr").forEach((row) => {
        const cells = row.querySelectorAll("td");

        if (cells.length < 2) {
          return;
        }

        const key = cells[0]?.innerText?.replace(/\s+/g, " ")?.trim();

        const value = cells[1]?.innerText?.replace(/\s+/g, " ")?.trim();

        if (key && value) {
          techDetails[key] = value;
        }
      });

      // ASIN
      const asin = productDetails["ASIN"] || null;

      // RETURN PRODUCT
      return {
        title: text("#productTitle"),

        asin,

        rating: attr("#acrPopover", "title"),

        reviewCount: text("#acrCustomerReviewText"),

        boughtLastMonth: text("#social-proofing-faceout-title-tk_bought"),

        price: text(".a-price .a-offscreen"),

        color: text("#inline-twister-expanded-dimension-text-color_name"),

        size: text("#inline-twister-expanded-dimension-text-size_name"),

        offers,

        about: text("#feature-bullets"),

        productDetails,

        techDetails,

        reviewSummary: text('[data-testid="overall-summary"]'),
      };
    });

    console.log(`Scraped ${url} in ${Date.now() - start}ms`);

    return product;
  } finally {
    await browser.close();
  }
}
