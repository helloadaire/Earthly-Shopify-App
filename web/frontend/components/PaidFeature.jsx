import { useState } from "react";
import { Card, Link, Button, ProgressBar, Badge } from "@shopify/polaris";
import { Toast, useNavigate } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

export function PaidFeature() {
  const [isLoading, setIsLoading] = useState(false);
  const [toastProps, setToastProps] = useState({ content: null });
  const [capacityReached, setCapacityReached] = useState(false);
  const navigate = useNavigate();
  const fetch = useAuthenticatedFetch();

  /*
   * This will use the authenticated fetch hook to make a request to our server
   * to create a usage record. If the usage record is created successfully, we
   * will set the toastProps to display a success message. If the usage record
   * is not created successfully, we will set the toastProps to display an error
   * If the usage record is not created successfully because the capacity has
   * been reached, we will set the capacityReached state to true so that the
   * button is disabled.
   */
  const handleCreateUsageRecord = async () => {
    setIsLoading(true);
    const response = await fetch("/api/usage/create");
    const body = await response.json();
    body.capacityReach ? setCapacityReached(true) : setCapacityReached(false);
    setIsLoading(false);

    if (response.ok) {
      setToastProps({ content: "Usage record created!" });
    } else {
      setToastProps({
        content: "There was an error creating usage record",
        error: true,
      });
    }
  };

  /*
   * This uses AppBridge to open the  app subscription management page
   * in the Shopify Admin.
   */
  const handleNavigateToSubscriptionPage = () => {
    navigate("/settings/billing/subscriptions", {
      replace: true,
      target: "host",
    });
  };

  const toastMarkup = toastProps.content && (
    <Toast {...toastProps} onDismiss={() => setToastProps({ content: null })} />
  );

  const [billingState, setBillingState] = useState("-");
  const [billingMessage, setBillingMessage] = useState("-");

  function BillingCard(input) {
    if (billingState == "first") {
      return (
        <div>
          <a target="_blank" href={billingMessage}>
            <Button primary>APPROVE</Button>
          </a>{" "}
          Please approve us to charge you. OUR TERMS{" "}
        </div>
      );
    } else {
      var billingStats = billingMessage.split(":");
      var progressCounter = Math.round(
        (billingStats[0] * 100) / billingStats[1]
      );
      return (
        <div>
          <div style={{ width: "100%" }}>
            <Badge status="success">Contributions: {billingStats[0]} GBP</Badge>
            &nbsp;
            <Badge status="info">Spending Limit: {billingStats[1]} GBP</Badge>
            <span style={{ float: "right", margin: "0px 0px 15px 0px" }}>
              <Button size="slim" onClick={handleNavigateToSubscriptionPage}>
                Increase Spending LIMIT
              </Button>
            </span>
            <ProgressBar color="success" progress={progressCounter} />
          </div>
        </div>
      );
    }
  }

  function handleCheckBilling(qresult) {
    setBillingState(qresult["code"]);
    setBillingMessage(qresult["message"]);
  }
  useAppQuery({
    url: "/api/checkbilling/",
    reactQueryOptions: {
      onSuccess: (qresult) => {
        handleCheckBilling(qresult);
      },
    },
  });

  return (
    <>
      {toastMarkup}
      <Card
        sectioned
        /*
        primaryFooterAction={{
          content: "Create Usage Record",
          onAction: handleCreateUsageRecord,
          loading: isLoading,
          disabled: capacityReached,
        }}
		*/
      >
        <BillingCard />
      </Card>
    </>
  );
}
