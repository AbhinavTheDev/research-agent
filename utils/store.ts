import { models } from "@/ai/models.ts";
import { Store } from "@tanstack/react-store";

/**
 * Store to keep the variables so that it can be accessed from
 * everywhere without interconnection and uplifting
 */
export const chatStore = new Store({
  webSearch: false,
  academicSearch: false,
  model: models[5],
  provider: models[5].providers[0],
});
