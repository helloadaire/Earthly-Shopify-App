# Earthly-Shopify-App

Basic instructions:

1. Create Base App (default earthly-app) | https://shopify.dev/docs/apps/getting-started/create
```console
npm init @shopify/app@latest
cd earthly-app
npm run dev
```

2. Add dependencies
```console
cd web/frontend
npm install @shopify/react-form
npm install @shopify/react-hooks
```

2. Register the theme app extentions (From APP root: cd earthly-app)
```console
npm run shopify app generate extension
earthly-message
npm run shopify app generate extension
eathly-checkout-ui-ext
```
* Chekout UI requires Shopify Plus or a Partner' Account Development store and previews in sandbox. (Skip if not needed.)

3. Overwrite the base APP files with provided code

4. Deploy APP and verify via Partners Admin side
```console
npm run deploy
```
