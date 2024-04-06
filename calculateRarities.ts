import { OPENSEA_COLLECTION_ID } from "./config.ts";

import type { Data } from "./types.ts";

const data: Data[] = [];

for await (const file of Deno.readDir(`${OPENSEA_COLLECTION_ID}_metadata`)) {
  if (file.name === ".DS_Store") continue;
  try {
    const loaded = await Deno.readTextFile(
      `${OPENSEA_COLLECTION_ID}_metadata/${file.name}`,
    );
    const parsed = JSON.parse(loaded) as Data;
    data.push(parsed);
  } catch {
    console.log(
      "Could not read",
      `${OPENSEA_COLLECTION_ID}_metadata/${file.name}`,
    );
  }
}

const attributes = data.reduce(
  (acc, item) => {
    for (const { trait_type: k, value: v } of item.attributes) {
      if (!acc[k]) acc[k] = {};
      if (!acc[k][v]) acc[k][v] = 0;
      acc[k][v] = acc[k][v] += 1;
    }

    return acc;
  },
  {} as Record<string, Record<string, number>>,
);

const rarities = Object.entries(attributes).reduce(
  (acc, [traitName, trait]) => {
    const traitTotal = Object.values(trait).reduce((acc, x) => acc + x, 0);

    for (const [k, v] of Object.entries(trait)) {
      if (!acc[traitName]) acc[traitName] = {};
      // lower = better
      acc[traitName][k] = v / traitTotal;
    }

    return acc;
  },
  {} as Record<string, Record<string, number>>,
);

await Deno.writeTextFile(
  `${OPENSEA_COLLECTION_ID}_rarities.json`,
  JSON.stringify(rarities),
);
