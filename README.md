# Rare NFT Finder

1. Fetches metadata files for each NFT in a collection
2. Calculates rarities of all NFT traits
3. Finds the best price-rarity wise listed NFTs on OpenSea in a specified budget

At the end, it will log the best items and even open browser tabs for you to buy them.

## Getting Started

1. Create an env file

```bash
cp example.env .env
```

2. Fill the .env file

3. Run the scripts:

- deno task fetch-metadata
- deno task calculate-rarities
- deno task find-available
