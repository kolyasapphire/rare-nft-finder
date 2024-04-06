import { ethers } from "ethers";
import { OpenSeaSDK, Chain } from "opensea-js";
import type { Listing } from "opensea-js";

import {
  OPENSEA_KEY,
  OPENSEA_COLLECTION_ID,
  COLLECTION_CONTRACT,
  ITEMS_AMOUNT,
  MAX_PRICE,
} from "./config.ts";

const rarities = JSON.parse(
  await Deno.readTextFile(`${OPENSEA_COLLECTION_ID}_rarities.json`),
) as Record<string, Record<string, number>>;

const provider = new ethers.JsonRpcProvider("https://mainnet.infura.io");

const openseaSDK = new OpenSeaSDK(provider, {
  chain: Chain.Mainnet,
  apiKey: OPENSEA_KEY,
});

const listings: Listing[] = [];

let next = undefined;

while (true) {
  try {
    const batch = await openseaSDK.api.getAllListings(
      OPENSEA_COLLECTION_ID,
      100,
      next,
    );
    listings.push(...batch.listings);
    next = batch.next;
    if (batch.listings.length !== 100) break;
  } catch {
    break;
  }
}

console.log("fetched", listings.length);

const onlyEth = listings.filter((x) => x.price.current.currency === "ETH");

const withoutDupes = onlyEth.filter((x, ix, arr) => {
  const firstIx = arr.findIndex(
    (y) =>
      x.protocol_data.parameters.offer[0].identifierOrCriteria ===
      y.protocol_data.parameters.offer[0].identifierOrCriteria,
  );
  return firstIx === ix;
});

console.log("filtered to", withoutDupes.length);

const calcRarity = (id: number) => {
  const thatOne = JSON.parse(
    Deno.readTextFileSync(`${OPENSEA_COLLECTION_ID}_metadata/${id}.json`),
  ) as {
    attributes: { trait_type: string; value: string }[];
  };
  // lower = better
  const cumulativeRarity = thatOne.attributes.reduce(
    (acc, item) => acc + rarities[item.trait_type][item.value],
    0,
  );
  return cumulativeRarity;
};

const mapped = withoutDupes.map((x) => {
  const id = parseInt(x.protocol_data.parameters.offer[0].identifierOrCriteria);
  const price = parseInt(x.price.current.value);
  const rarity = calcRarity(id);
  return {
    id,
    price,
    rarity,
    ratio: price / rarity,
  };
});

// 1 eth 10 rarity should be better than 1 eth 5 rarity
// (1/10 = 0,1) (1/5 = 0,2) so higher = better here

const sorted = mapped.sort((a, b) => b.ratio - a.ratio);

console.log("Buy:");
sorted
  .filter((x) => x.price / 1e18 < MAX_PRICE)
  .slice(0, ITEMS_AMOUNT)
  .forEach((x) => {
    console.log(
      "id",
      x.id,
      "price",
      x.price / 1e18,
      "rarity",
      parseFloat(x.rarity.toFixed(3)),
      "ratio",
      parseFloat((x.ratio / 1e18).toFixed(3)),
    );
    const cmd = new Deno.Command("open", {
      args: [
        `https://opensea.io/assets/ethereum/${COLLECTION_CONTRACT}/${x.id}`,
      ],
    });
    cmd.spawn();
  });
