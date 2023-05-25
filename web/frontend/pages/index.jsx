import { useState, useCallback, useMemo, useEffect } from "react";
import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
  DisplayText,
  TextStyle,
  Badge,
  MediaCard,
  RadioButton,
  EmptyState,
  AccountConnection,
} from "@shopify/polaris";
import { earthlyHero } from "../assets";
import { agroforestry } from "../assets";
import { eden } from "../assets";
import { peatland } from "../assets";
import { tropical } from "../assets";

import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import { PaidFeature } from "../components";

export default function HomePage() {
  // init
  const [connected, setConnected] = useState(false);
  const [validMerchant, setValidMerchant] = useState(false);
  const accountName = connected ? " O N " : "";
  const AuthenticatedFetch = useAuthenticatedFetch();
  const mystyle = {
    display: "flex",
    boxShadow: "var(--p-shadow-card)",
    outline: "var(--p-border-width-1) solid transparent",
    margin: "5px 0px",
    borderRadius: "var(--p-border-radius-2)",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "10px",
    background: "white",
  };
  const projectsCard = "Loading";
  const buttonText = connected ? "Disconnect" : "Connect";
  const details = connected ? (
    <p>
      You are investing in Nature with every order. You can pause at anytime!{" "}
      <a target="_parent" href="https://admin.shopify.com/store/earthly-app/themes/current/editor?context=apps">BADGE settings</a>
    </p>
  ) : (
    "Investment on Pause. You can re connect at anytime!"
  );
  const terms = connected ? null : (
    <p>
      By clicking <strong>Connect</strong>, you agree to accept Earthly App's
      <Link url="https://earthly.org/"> terms and conditions</Link>.
    </p>
  );
  // Handle connect button
  // You can use useAuthenticatedFetch for authenticated post
  const handleAction = useCallback((e) => {
    AuthenticatedFetch("/api/saveconfig", {
      method: "POST",
      body: '{"code":"savestatus","message":"' + e.target.innerText + '"}',
      headers: {
        "Content-Type": "application/json",
      },
    }).then((data) => {
      console.log(data);
      setConnected((connected) => !connected);
    });
  }, []);
  // Handle package select 
  // You can use useAuthenticatedFetch for authenticated post
  const handlePackageAction = (e) => {
    console.log(e.target.value);
    let packageInfo = e.target.value;
    AuthenticatedFetch("/api/saveconfig", {
      method: "POST",
      body: '{"code":"savepackage","message":"' + packageInfo + '"}',
      headers: {
        "Content-Type": "application/json",
      },
    }).then((data) => {
      console.log(data);
    });
  };
  // Show Shop panel if shop is registered only
  function showPanel(qresult) {
	  console.log(qresult);
	  setValidMerchant(true);
      //document.getElementsByClassName("connectionPanel")[0].style.visibility = "visible";
      let selectedPackaged = qresult.amount + ":" + qresult.earthlyProjectId + ":" + qresult.appCharge;
      document.querySelector('[value="' + selectedPackaged + '"]').checked = true;
  }
  // Query Shop info 
  // You can use useAppQuery for authenticated get
  /*
  useEffect(() => {
    useAppQuery({
    url: "/api/getconfig/",
    reactQueryOptions: {
      onSuccess: (qresult) => {
        // If active show connected and projects
        if (qresult.status == "Active") {
          setConnected((connected) => true);
          showPanel(qresult);
        } // Else if paused then show disconncted but still show projects
        else if (qresult.status == "Pause") {
          setConnected((connected) => false);
          showPanel(qresult);
        } // Else show nothing
        else {
          //Nothing
        }
      },
    },
  });
  }, []);
  */
  const mainConfig = useAppQuery({
    url: "/api/getconfig/",
    reactQueryOptions: {
      onSuccess: (qresult) => {
        // If active show connected and projects
        if (qresult.status == "Active") {
          setConnected((connected) => true);
          showPanel(qresult);
        } // Else if paused then show disconncted but still show projects
        else if (qresult.status == "Pause") {
          setConnected((connected) => false);
          showPanel(qresult);
        } // Else show nothing
        else {
          //Nothing
        }
      },
    },
  });

  // Render
  //https://polaris.shopify.com/components/layout-and-structure/media-card
  //https://polaris.shopify.com/components/actions/account-connection
  //https://polaris.shopify.com/components/feedback-indicators/badge
  return (
    <Page>
      <Layout>
        <Layout.Section>
          <MediaCard
            title="What does the Earthly app do?"
            primaryAction={{
              content: "GET STARTED",
              onAction: () => {
                window.open("https://earthly.org/", "_blank").focus();
              },
            }}
            description="Invest in nature with every order on your Shopify Store by integrating with Earthly!  You can choose the nature based projects you support and show your user that you do so throughout your website."
          >
            <img
              alt=""
              width="100%"
              height="100%"
              style={{
                objectFit: "cover",
                objectPosition: "center",
              }}
              src={earthlyHero}
            />
          </MediaCard>
        </Layout.Section>
        <div className="connectionPanel" style={{ visibility: validMerchant ? "visible" : "hidden" }}>
          <Layout.Section>
            <AccountConnection
              accountName={accountName}
              connected={connected}
              title="Invest In Nature"
              action={{
                content: buttonText,
                onAction: handleAction,
              }}
              details={details}
              termsOfService={terms}
            />
          </Layout.Section>
		  <Layout.Section>
			<PaidFeature />
				<Card />
		  </Layout.Section>
          <Layout.Section>
            <Layout>
              <Layout.Section>
                <p style={{ fontSize: "16px", margin: "15px 0" }}>
                  Choose the project to support
                </p>
              </Layout.Section>
              <Layout.Section oneHalf>
                <MediaCard
                  title="Eden Reforestation"
                  description="This trail-blazing project run by Eden Reforestation Projects has reforestation and poverty alleviation at its heart. Mangroves pack some punch when it comes to carbon sequestration but also provide a whole load of other natural benefits such as storm surge protection and vital habitat for many species. Cannot be used for emissions balancing."
                >
                  <img
                    alt=""
                    width="100%"
                    height="100%"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                    src={ agroforestry }
                  />
                </MediaCard>
                <div style={mystyle} onChange={handlePackageAction}>
                  <Badge status="success">Planting Trees</Badge>
                  <RadioButton
                    label="0.20 GBP"
                    helpText="1 Tree"
                    name="earthlypackage"
                    value="1:5f96f967a3a85800118be4d1:0.2"
                  />
                  <RadioButton
                    label="0.40 GBP"
                    helpText="2 Trees"
                    name="earthlypackage"
                    value="2:5f96f967a3a85800118be4d1:0.4"
                  />
                  <RadioButton
                    label="1 GBP"
                    helpText="5 Trees"
                    name="earthlypackage"
                    value="5:5f96f967a3a85800118be4d1:1"
                  />
                </div>
              </Layout.Section>
              <Layout.Section oneHalf>
                <MediaCard
                  title="Tropical Forest Protection, Keo Seima"
                  description="A REDD+ project with a focus on reducing high deforestation rates in eastern Cambodia by helping secure land rights for the indigenous Bunong in the area. The project began in 2010 and impacts more than 20,000 people. The project is Verra approved and can be used for emissions balancing."
                >
                  <img
                    alt=""
                    width="100%"
                    height="100%"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                    src={ eden }
                  />
                </MediaCard>
                <div style={mystyle} onChange={handlePackageAction}>
				  <span style={{ width: "35%"}}>
                  <Badge status="success">m2 of protected forest</Badge>
				  </span>
                  <RadioButton
                    label="0.14 GBP"
                    helpText="10m2"
                    name="earthlypackage"
                    value="0.0085:601ae0006fc1d70018fef078:0.14"
                  />
                  <RadioButton
                    label="0.29 GBP"
                    helpText="20m2"
                    name="earthlypackage"
                    value="0.017:601ae0006fc1d70018fef078:0.29"
                  />
                  <RadioButton
                    label="0.98 GBP"
                    helpText="70m2"
                    name="earthlypackage"
                    value="0.06:601ae0006fc1d70018fef078:0.98"
                  />
                </div>
              </Layout.Section>
			  <Layout.Section oneHalf>
                <MediaCard
                  title="Peatland Protection, Rimba Raya"
                  description="The Rimba Raya Biodiversity Reserve project is protecting one of the most highly endangered ecosystems in the world. Without this project, the carbon-rich, peatland forest of Rimba Raya would have been turned into palm oil estates, emitting over 100 million tonnes of carbon into the atmosphere. Instead, the project is protecting the land and working with local communities to achieve all 17 of the Sustainable Development Goals. The project is Verra approved and can be used for emissions balancing."
                >
                  <img
                    alt=""
                    width="100%"
                    height="100%"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                    src={peatland}
                  />
                </MediaCard>
                <div style={mystyle} onChange={handlePackageAction}>
				  <span style={{ width: "35%"}}>
                  <Badge status="success">m2 of peatland protectedt</Badge>
				  </span>
                  <RadioButton
                    label="0.39 GBP"
                    helpText="5m2"
                    name="earthlypackage"
                    value="0.027:627b990fb96c5a0018eaa5e6:0.39"
                  />
                  <RadioButton
                    label="0.78 GBP"
                    helpText="10m2"
                    name="earthlypackage"
                    value="0.027:627b990fb96c5a0018eaa5e6:0.78"
                  />
                  <RadioButton
                    label="1.17 GBP"
                    helpText="15m2"
                    name="earthlypackage"
                    value="0.081:627b990fb96c5a0018eaa5e6:1.17"
                  />
                </div>
              </Layout.Section>
			  <Layout.Section oneHalf>
                <MediaCard
                  title="Agroforestry- Tree Planting Initiative, Kenya"
                  description="Two decades of impactful community-centered tree planting successes later, the TIST project in Kenya is still growing! With each passing year, a growing community of farmers are including agroforestry on their land as part of the TIST program. But the benefits in carbon payments after trees are planted takes several years to cash in. The initiative closes that gap in conservation finance by supporting farmers right from the beginning of their carbon removal journey. This means their positive efforts for the environment are always rewarded, including when the finance is needed most. Cannot be used for emissions balancing."
                >
                  <img
                    alt=""
                    width="100%"
                    height="100%"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                    src= {tropical}
                  />
                </MediaCard>
                <div style={mystyle} onChange={handlePackageAction}>
				  <span style={{ width: "35%"}}>
                  <Badge status="success">Planting trees</Badge>
				  </span>
                  <RadioButton
                    label="1.74 GBP"
                    helpText="1 Tree"
                    name="earthlypackage"
                    value="1:6271734cb96c5a0018eaa2e1:1.74"
                  />
                  <RadioButton
                    label="3.48 GBP"
                    helpText="2 Trees"
                    name="earthlypackage"
                    value="2:6271734cb96c5a0018eaa2e1:3.48"
                  />
                  <RadioButton
                    label="5.22 GBP"
                    helpText="3 Trees"
                    name="earthlypackage"
                    value="3:6271734cb96c5a0018eaa2e1:5.22"
                  />
                </div>
				<div style={{ height: "50px"}} >&nbsp;</div>
              </Layout.Section>
            </Layout>
          </Layout.Section>
        </div>
      </Layout>
    </Page>
  );
}
