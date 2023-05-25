// @ts-check
import 'dotenv/config';
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import shopify from "./shopify.js";
import {
  billingConfig,
  createUsageRecord,
  getAppSubscription,
} from "./billing.js";

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

// Set up Shopify authentication and webhook handling
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
const uri = process.env.MONGODBCS;
const client = new MongoClient(uri);
// Get config | returns config based on user shop domain/id

function registerUser(result, first) {
  const client2 = new MongoClient(uri);
  console.log("Register default user id on mongo");
  console.log(result);
  if (result["created"] == true) {
    try {
      client2.connect();
      const db = client2.db("earthlyshopifyapp");
      const collection = db.collection("shops");
      var myquery = { shopId: first.shopId };
      var newvalues = { $set: { earthlyAlmondUserId: result["almondUserId"] } };
      const supdate = collection.updateOne(
        myquery,
        newvalues,
        function (err, result) {}
      );
      //console.log(supdate);
      //console.log(newvalues);
    } catch (err) {
      console.log("ERROR:" + err);
    } finally {
      client2.close();
    }
  } else {
    console.log("BAD");
  }
}

/*
app.get("/api/usage/create", async (_req, res) => {
  let status = 200;
  let error = null;
  let resp = null;
  let capacityReached = false;
  try {
    resp = await createUsageRecord(res.locals.shopify.session, 0.2);
    //resp = await getAppSubscription(res.locals.shopify.session);
    capacityReached = resp.capacityReached;
    if (capacityReached && !resp.createdRecord) {
      error = "Could not create record because capacity was reached";
      status = 400;
    }
  } catch (e) {
    console.log(`Failed to process usage/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res
    .status(status)
    .send({ success: status === 200, capacityReach: capacityReached, error });
});
app.post('/secret', async (_req, res) => {
const client3 = new MongoClient(uri);	
	var refURL = _req.headers.referer;
  refURL=refURL.split('/');
  let shopName = refURL[2];
  
  //console.log(shopName);
  //res.status(200).send('{"code":"11 &#127794;"}');
  try {
    await client3.connect();
    const db = client3.db("earthlyshopifyapp");
    const collection = db.collection("shops");
    const first = await collection.findOne({
      shopId: shopName,
    });
    if (first == null) {
      res.status(200).send('BAD');
    }
	else {
      //console.log(first);
      //res.status(200).send(first);
	  var myHeaders = new Headers();
		myHeaders.append("Authorization", first.earthlyApiKey);

		var requestOptions = {
		  method: 'GET',
		  headers: myHeaders,
		  redirect: 'follow'
		};
		fetch("https://backend.staging.almond.io/api/v2/assets", requestOptions)
		  .then(response => response.json())
		  .then(result => res.status(200).send(result))
		  .catch(error => console.log('error', error));
			}
		  } catch (err) {
			console.log("ERROR:" + err);
		  } finally {
			await client3.close();
		  }
})
*/
app.get("/api/checkbilling", async (_req, res) => {
  const plans = Object.keys(billingConfig);
  const session = res.locals.shopify.session;
  const hasPayment = await shopify.api.billing.check({
    session,
    plans: plans,
    isTest: true,
  });
  console.log(hasPayment);
  if (hasPayment) {
    var resp = await getAppSubscription(res.locals.shopify.session);
    console.log(resp.balanceUsed);
    res
      .status(200)
      .send(
        '{"code":"second","message":"' +
          resp.balanceUsed +
          ":" +
          resp.cappedAmount +
          '"}'
      );
  } else {
    console.log("first");
    var sabr = await shopify.api.billing.request({
      session,
      plan: plans[0],
      isTest: true,
    });
    res.status(200).send('{"code":"first","message":"' + sabr + '"}');
  }
});
app.get("/api/getconfig", async (_req, res) => {
  let refURL = new URLSearchParams(_req.headers.referer);
  let shopName = refURL.get("shop");
  console.log(shopName + " Opened APP");
  try {
    await client.connect();
    const db = client.db("earthlyshopifyapp");
    const collection = db.collection("shops");
    const first = await collection.findOne({
      shopId: shopName,
    });
    //console.log(first);
    // If null then log as potential merchant
    //res.status(200).send(first);
    if (first == null) {
      console.log(shopName + " None registered merchant opened APP.");
      res.status(200).send('{"code":"None registered merchant opened APP."}'); 
    }
    // If first time then send a call to Earthly so we can create a default user id
    // send refresh after 5 seconds
    else if (!first.earthlyAlmondUserId) {
      console.log(
        shopName + " First time Using APP. Creating default user id on Earthly"
      );
      var myHeaders = new Headers();
      myHeaders.append("Authorization", first.earthlyApiKey);
      myHeaders.append("Content-Type", "application/json");
      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        redirect: "follow",
      };
      fetch("https://backend.staging.almond.io/api/v2/users/", requestOptions)
        .then((response) => response.json())
        .then((result) => registerUser(result, first))
        .catch((error) => console.log("error", error));
      setTimeout(function () {
        res.redirect(_req.headers.referer);
      }, 5000);
    } else {
      console.log(shopName + " Registered merchant opened APP.");
      res.status(200).send(first);
    }
  } catch (err) {
    console.log("MONGOdb ERROR:" + err);
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
        console.log("Pause it");
        var newvalues = { $set: { status: "Pause" } };
      } else if (_req.body.message == "Connect") {
        var newvalues = { $set: { status: "Active" } };
        console.log("Activate it");
      }
	  else{
		console.log("BAD body request. Must be either Disconnect or Connect:");
		res.status(200).send('{"code":"BAD body request. Must be either Disconnect or Connect"}'); 
		return;
	  }
      const supdate = await collection.updateOne(
        myquery,
        newvalues,
        function (err, result) {}
      );
      //console.log(supdate);
      //console.log(newvalues);
      res.status(200).send('{"code":"OK"}');
    } catch (err) {
      console.log("MONGOdb ERROR:" + err);
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
          amount: parseFloat(packageInfo[0]),
          earthlyProjectId: packageInfo[1],
          appCharge: parseFloat(packageInfo[2]),
        },
      };
      const pupdate = await collection.updateOne(
        myquery,
        newvalues,
        function (err, result) {}
      );
      //console.log(pupdate);
      //console.log(newvalues);
      res.status(200).send('{"code":"OK"}');
    } catch (err) {
      console.log("MONGOdb ERROR:" + err);
    } finally {
      await client.close();
    }
  }
  else{
	console.log("BAD code request. Must be either savestatus or savepackage:");
	res.status(200).send('{"code":"BAD code request. Must be either savestatus or savepackage"}');	
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
