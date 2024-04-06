import { URL_BASE, OPENSEA_COLLECTION_ID } from "./config.ts";

try {
  await Deno.stat(`${OPENSEA_COLLECTION_ID}_metadata/`);
} catch {
  await Deno.mkdir(`${OPENSEA_COLLECTION_ID}_metadata/`);
}

let id = 1;
while (true) {
  try {
    await Deno.stat(`${OPENSEA_COLLECTION_ID}_metadata/${id}.json`);
    console.log(id, "exists");
    id += 1;
    continue;
  } catch {
    // Deno linter hates empty blocks, sorry Deno
  }

  const res = await fetch(URL_BASE + id);

  if (!res.ok) {
    // 99% just ran into a non-existing item
    console.error("Error");
    break;
  }

  console.log(id, "downloaded");

  const json = await res.json();

  await Deno.writeTextFile(
    `${OPENSEA_COLLECTION_ID}_metadata/${id}.json`,
    JSON.stringify(json),
  );
  id += 1;

  // Lets be extra safe so we don't cause any trouble
  await new Promise((res) => setTimeout(res, 100));
}
