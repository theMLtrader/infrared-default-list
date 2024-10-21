# Extending the gauge list

This README provides instructions for third parties on how to extend the gauge list in our application. By following these steps, you can add your gauge to the public repository, making it visible and accessible within our app.

## Prerequisites

Before you begin, ensure you have:

1. A GitHub account
2. Basic knowledge of JSON and Git
3. Your gauge's details ready
4. Knowledge of which network you're adding the gauge for

## Steps to add your gauge

### 1. Prepare necessary asset files

You only need to provide assets if they're not already in the `src/assets` folder or if you're introducing new elements (e.g., a new protocol or token). For any new or missing assets:

Add any new token assets to `/src/assets/tokens` and new protocol assets to `src/assets/protocols`.

- You should use an SVG file.
- If you absolutely do not have an SVG file add a png to `src/assets/tokens/new` or `src/assets/protocols/new`. Ensure it is larger than 128x128 and is very high quality.

### 2. Update JSON files

1. Fork the repository to your GitHub account.

2. Clone your forked repository to your local machine.

3. Navigate to the `src/gauges/{network}/defaultGaugeList.json` file, where `{network}` is the network you're adding the gauge for (e.g., "bartio" for the Bartio testnet).

4. Add your gauge to the `gauges` array in the JSON file. Follow this structure:

   ```json
   {
     "beraRewardsVault": "0x...",
     "lpTokenAddress": "0x...",
     "logo": "your-logo-filename.svg" // Optional
     "name": "Your Gauge Name",
     "protocol": "your_protocol_id",
     "types": ["type1", "type2"],
     "underlyingTokens": ["0x...", "0x..."],
     "url": "https://your-protocol-url.com/provide-liquidity"
   }
   ```

   Ensure that:

   - `protocol` matches an `id` in the `protocols` array
   - `types` contains valid types from the `types` object
   - All `underlyingTokens` are listed in the token list (`src/tokens/{network}/defaultTokenList.json`)
   - The `url` field is a direct link to provide liquidity for the LP token
   - The `logo` field is optional. Only add it if you've placed a new logo file in the `src/assets` folder

5. If your protocol is not listed in the `protocols` array, add it:

   ```json
   {
     "description": "A brief description of your protocol.",
     "id": "your_unique_protocol_id",
     "logo": "your-protocol-logo.svg",
     "name": "Your Protocol Name",
     "url": "https://your-protocol-url.com"
   }
   ```

   Ensure you've added the protocol logo to the `src/assets` folder if it's not already there.

6. If your gauge uses tokens not in the token list, add them to `src/tokens/{network}/defaultTokenList.json`:

   ```json
   {
     "address": "0x...",
     "chainId": 80084,
     "decimals": 18,
     "logo": "your-token-logo.svg",
     "name": "Your Token Name",
     "symbol": "XYZ",
     "tags": ["tag1", "tag2"]
   }
   ```

   Add the token logo to the `src/assets` folder if it's not already present.

7. Commit your changes and push to your forked repository.

8. Create a Pull Request (PR) from your fork to the main repository.

## Guidelines

- Ensure all addresses are valid and correctly formatted.
- Use clear, descriptive names for your gauge, protocol, and tokens.
- Provide accurate and concise descriptions.
- Use appropriate tags and types.
- The `url` field for gauges should be a direct link to provide liquidity for the LP token.
- Make sure you're updating the correct network-specific files (replace `{network}` with the appropriate network name).

## Review process

After submitting your PR:

1. Our team will review your submission.
2. We may request changes or clarifications if needed.
3. Once approved, your gauge will be merged into the main list and become visible in the app for the specified network.

Thank you for contributing to our ecosystem!

### Internal review process

If a `png`/`webp` image is submitted, ensure a `svg` has been generated. If not, ensure the assets are in the `assets/*/new` folder and run `convert-new-assets-to-svg`. If the svg looks good and is smaller than the webp use it, otherwise use the webp.
