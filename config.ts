import { load } from "dotenv";

await load({ export: true });

const URL_BASE_MB = Deno.env.get("URL_BASE");
if (!URL_BASE_MB) {
  console.error("No ENV Variables, exiting");
  Deno.exit();
}
const URL_BASE = URL_BASE_MB!;
export { URL_BASE };

export const COLLECTION_CONTRACT = Deno.env.get("COLLECTION_CONTRACT")!;
export const OPENSEA_COLLECTION_ID = Deno.env.get("OPENSEA_COLLECTION_ID")!;
export const OPENSEA_KEY = Deno.env.get("OPENSEA_KEY")!;
export const ITEMS_AMOUNT = parseInt(Deno.env.get("ITEMS_AMOUNT")!);
export const MAX_PRICE = parseFloat(Deno.env.get("MAX_PRICE")!);
