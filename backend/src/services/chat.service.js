import * as aiService from "../services/ai.service.js";

export const processMultiProductChat = async (products, history) => {
  console.log(
    `Processing question across ${products.length} active product(s)...`,
  );

  const reply = await aiService.askMultiProductFollowUp(products, history);

  if (!reply) {
    throw new Error("Empty response received from AI provider");
  }

  return reply;
};
