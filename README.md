# Diamond Jewelry Co - Hydrogen Storefront

This repository contains the Diamond Jewelry Co storefront built with Shopify Hydrogen, Remix, and Oxygen.

## What this project includes

- Shopify Hydrogen + Remix storefront
- Customer account support
- Tailwind CSS and responsive UI
- Shop and product GraphQL queries
- Static assets and image assets for the storefront
- Local dev server and production build configuration

## Repo location

This project is published at:

`https://github.com/diamondjewelry18k-hub/TIENDAONLINE`

## Requirements

- Node.js 18 or higher
- npm
- Shopify Storefront API credentials
- Customer Account API configuration for account routes

## Environment setup

Copy `.env.example` if available or create `.env` with the following values:

```env
SESSION_SECRET="cualquiertexto_largo"
PUBLIC_STORE_DOMAIN="diamondjewelry-co.myshopify.com"
PUBLIC_STOREFRONT_API_TOKEN="<PUBLIC_STORE_API_TOKEN>"
PRIVATE_STOREFRONT_API_TOKEN="<PRIVATE_STORE_API_TOKEN>"
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID="<CUSTOMER_ACCOUNT_API_CLIENT_ID>"
PUBLIC_CUSTOMER_ACCOUNT_API_URL="https://diamondjewelry-co.myshopify.com"
PRIVATE_CUSTOMER_ACCOUNT_API_SECRET="<CUSTOMER_ACCOUNT_API_SECRET>"
PUBLIC_CHECKOUT_DOMAIN="https://checkout.shopify.com"
SHOP_ID="<SHOP_ID>"
```

### Important

- `PUBLIC_STOREFRONT_API_TOKEN` must be the public storefront token
- `PRIVATE_STOREFRONT_API_TOKEN` must be the private storefront token
- Do not store admin API keys or OAuth secrets here
- `.env` is ignored by git

## Run locally

```bash
git clone https://github.com/diamondjewelry18k-hub/TIENDAONLINE.git
cd TIENDAONLINE
npm install --legacy-peer-deps
npm run dev
```

Then open the local dev server shown in the terminal.

## Build for production

```bash
npm run build
```

## Notes

- If the Storefront API returns `403`, verify your API token permissions and that the store domain is correct.
- Ensure the menus `main-menu` and `footer` exist in Shopify navigation.
- If customer account routes fail, verify the Customer Account API client ID and secret settings in Shopify.

## Useful links

- [Shopify Hydrogen docs](https://shopify.dev/custom-storefronts/hydrogen)
- [Remix docs](https://remix.run/docs)
- [Shopify Storefront API](https://shopify.dev/docs/api/storefront)
