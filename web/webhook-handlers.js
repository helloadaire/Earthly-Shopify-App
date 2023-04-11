import { DeliveryMethod } from "@shopify/shopify-api";
import { MongoClient } from "mongodb";

export default {
  // Handle Order Paid Call Back.
  // 1. Query shop that triggered the call. Read shop settings and skip if shop status is Paused. Continue to step 2 if shop is Active.
  // 2. Send API call to Earthly to create new assets based on shop amount multiplier. If successfull move to step 3.
  // 3. Register event and relevant order information under records collection 
  ORDERS_PAID: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
	  // ini
      const payload = JSON.parse(body);
      const order_id = '{"orderId":' + payload["id"] + "}";
      const uri =
        "mongodb+srv://earthlyapp:70JKQBvUUWkbLrWd@earthly.fkmgicj.mongodb.net/?retryWrites=true&w=majority";
      const client = new MongoClient(uri);
      console.log(shop+" Webhook incoming");
	  // Records events that happen successfully STEP 3
      function captureRecord(result, first) {
        const client2 = new MongoClient(uri);
        console.log("capture record mongo");
        console.log(result["created"]);
        try {
          client2.connect();
          const db = client2.db("earthlyshopifyapp");
          const collection = db.collection("records");
          var record = {
            earthlyApiKey: first.earthlyApiKey,
            earthlyMessage: result["created"],
            earthlyProjectId: first.earthlyProjectId,
            shopId: first.shopId,
            shopifyMessage: order_id,
          };
          const supdate = collection.insertOne(
            record,
            function (err, result) {}
          );
          console.log(supdate);
          console.log(record);
        } finally {
          client2.close();
        }
      }
	  // STEP 1
      try {
        // Get settings
        await client.connect();
        const db = client.db("earthlyshopifyapp");
        const collection = db.collection("shops");
        const first = await collection.findOne({
          shopId: shop,
        });
        console.log(first.status);
        // Decide if we should register order
        if (first.status == "Active") {
          console.log("Account Active!");
          const clientc = new MongoClient(uri);
          await clientc.connect();
          const dbc = clientc.db("earthlyshopifyapp").collection("records");
          const firstc = await dbc.findOne({
            shopifyMessage: order_id,
          });
		  // STEP 2
		  // Make sure this order is not recorded already. Webhooks are often sent multiple times.
		  // If new record then create asset and record the event.
          console.log("Making sure this is not a duplicate!");
          console.log(firstc);
          if (firstc == null) {
            console.log("Not a Duplicate. Create Assets on Earthly.");
            var myHeaders = new Headers();
            myHeaders.append("Authorization", first.earthlyApiKey);
            myHeaders.append("Content-Type", "application/json");
            var raw = JSON.stringify({
              projectId: first.earthlyProjectId,
              userId: "642d622a148090001899014e",
              amount: first.amount,
            });
            var requestOptions = {
              method: "POST",
              headers: myHeaders,
              body: raw,
              redirect: "follow",
            };
            fetch(
              "https://backend.staging.almond.io/api/v2/assets",
              requestOptions
            )
              .then((response) => response.json())
              .then((result) => captureRecord(result, first, body))
              .catch((error) => console.log("error", error));
          } else {
            console.log("Duplicate Record, Skipped!");
          }
        } else if (first.status == "Pause") {
          console.log("Account Paused. Event skipped!");
        }
      } finally {
        await client.close();
      }
    },
  },
  /**
   * Customers can request their data from a store owner. When this happens,
   * Shopify invokes this webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
   */
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "orders_requested": [
      //     299938,
      //     280263,
      //     220458
      //   ],
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "data_request": {
      //     "id": 9999
      //   }
      // }
    },
  },

  /**
   * Store owners can request that data is deleted on behalf of a customer. When
   * this happens, Shopify invokes this webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-redact
   */
  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "orders_to_redact": [
      //     299938,
      //     280263,
      //     220458
      //   ]
      // }
    },
  },

  /**
   * 48 hours after a store owner uninstalls your app, Shopify invokes this
   * webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#shop-redact
   */
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com"
      // }
    },
  },
};