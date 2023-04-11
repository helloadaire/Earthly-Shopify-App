// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import shopify from "./shopify.js";

/*** Register Webhooks *****************************/
import webhookHandlers from "./webhook-handlers.js";
/***************************************************/

// Set up Shopify authentication and webhook handling
const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);
const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;
const app = express();
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: webhookHandlers })
);
// If you are adding routes outside of the /api path, remember to also add a proxy rule for them in web/frontend/vite.config.js
app.use("/api/*", shopify.validateAuthenticatedSession());
app.use(express.json());

/*** API Endpoints ***************************************/
// Get mongodb connection;
import { MongoClient } from "mongodb";
const uri =
  "mongodb+srv://earthlyapp:70JKQBvUUWkbLrWd@earthly.fkmgicj.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
// Get config | returns config based on user shop domain/id
app.get("/api/getconfig", async (_req, res) => {
  let refURL = new URLSearchParams(_req.headers.referer);
  let shopName = refURL.get("shop");
  console.log(shopName);
  try {
    await client.connect();
    const db = client.db("earthlyshopifyapp");
    const collection = db.collection("shops");
    const first = await collection.findOne({
      shopId: shopName,
    });
    res.status(200).send(first);
    console.log(first);
  } finally {
    await client.close();
  }
});
// Save config
app.post("/api/saveconfig", async (_req, res) => {
  let refURL = new URLSearchParams(_req.headers.referer);
  let shopName = refURL.get("shop");
  // Read shop prams and decide what to do
  console.log(shopName);
  console.log(_req.body.code);
  console.log(_req.body.message);
  // If status change then toggle status between Pause and Active
  if (_req.body.code == "savestatus") {
    try {
      await client.connect();
      const db = client.db("earthlyshopifyapp");
      const collection = db.collection("shops");
      var myquery = { shopId: shopName };
      if (_req.body.message == "Disconnect") {
        console.log("pause it");
        var newvalues = { $set: { status: "Pause" } };
      } else if (_req.body.message == "Connect") {
        var newvalues = { $set: { status: "Active" } };
        console.log("activate it it");
      }
      const supdate = await collection.updateOne(
        myquery,
        newvalues,
        function (err, result) {}
      );
      console.log(supdate);
      console.log(newvalues);
      res.status(200).send('{"code":"OK"}');
    } finally {
      await client.close();
    }
  } 
  // Else if saving package then update the shop document
  else if (_req.body.code == "savepackage") {
    try {
      await client.connect();
      const db = client.db("earthlyshopifyapp");
      const collection = db.collection("shops");
      var myquery = { shopId: shopName };
      let packageInfo = _req.body.message.split(":");
      var newvalues = {
        $set: {
          amount: parseInt(packageInfo[0]),
          earthlyProjectId: packageInfo[1],
        },
      };
      const pupdate = await collection.updateOne(
        myquery,
        newvalues,
        function (err, result) {}
      );
      console.log(pupdate);
      console.log(newvalues);
      res.status(200).send('{"code":"OK"}');
    } finally {
      await client.close();
    }
  }
});
/********************************************************************/
//Start APP
app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));
app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});
app.listen(PORT);
