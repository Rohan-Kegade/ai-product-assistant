import * as aiService from "../services/ai.service.js";

export async function* streamMultiProductChat(products, history) {
  console.log(
    `Processing question across ${products.length} active product(s)...`,
  );

  yield* aiService.streamMultiProductFollowUp(products, history);
}
