import * as aiService from "../services/ai.service.js";

// DB bookkeeping columns that carry no information for the model.
const OMIT_FROM_PROMPT = new Set(["id", "createdAt", "scrapedAt"]);

function toPromptProduct(product) {
  return Object.fromEntries(
    Object.entries(product).filter(
      ([key, value]) => !OMIT_FROM_PROMPT.has(key) && value != null,
    ),
  );
}

export async function* streamMultiProductChat(products, history) {
  console.log(
    `Processing question across ${products.length} active product(s)...`,
  );

  yield* aiService.streamMultiProductFollowUp(
    products.map(toPromptProduct),
    history,
  );
}
