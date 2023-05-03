1. Create a new DEV APP

Create Partners Account:
https://partners.shopify.com/

Create Test Store:
https://partners.shopify.com/

Install Shopify CLI - Follow instructions and create new blank app:
npm init @shopify/app@latest

Run the app so we can link it with our partners account: 
(** If you are on a local machine then you have to run a seperate https tunnel, I used Ngrok)
cd {app name}
npm run dev
shutdown app

Shutdown the app and go back to partners account, grab Client ID, Client Secret for the generated APP:
https://partners.shopify.com/

Install MongoDB:
cd {app name}
npm install mongodb
(** mongodb+srv://earthlyapp:70JKQBvUUWkbLrWd@earthly.fkmgicj.mongodb.net/?retryWrites=true&w=majority hardcoded in both index.js and webhook-handlres.js)

Delete blank APP files that we dont need:
web/gdpr.js
web/product-creator.js
web/frontend/pages/pagename.jsx
web/frontend/components/ProductsCard.jsx

Copy and overwrite the app files with these files from repository:

.dockerignore
.env
Dockerfile
shopify.app.toml
-extentions/*
-web/
-----index.js
-----billing.js
-----shopify.js
-----frontend/
-------------pages/
------------------index.jsx
-------------components/
-----------------------index.js
-----------------------PaidFeature.jsx

Overwrite values in these files with your own HOST, ID and Secret:
.env
Dockerfile
shopify.app.toml

Now run a dev version but dont install yet: (inside app root)
npm run dev
shutdown app

Go back to partners account:
Set up APP info
Publish Extentions
Distribute as Public APP

Last Run, now we can install, develop and test:
npm run dev

2. Deploy

When ready you can deploy using docker, please read the Dockerfile file and fill in missing values. 
