import { useState, useCallback, useMemo } from "react";
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
import { TitleBar } from "@shopify/app-bridge-react";
import { earthlyHero } from "../assets";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

export default function HomePage() {
  // init
  const [connected, setConnected] = useState(false);
  const accountName = connected ? " O N" : "";
  const appFetch = useAuthenticatedFetch();
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
      <a href="#">BADGE settings</a>
    </p>
  ) : (
    "Investment on Pause. You can re connect at anytime!"
  );
  const terms = connected ? null : (
    <p>
      By clicking <strong>Connect</strong>, you agree to accept Earthly App's
      <Link url="https://earthly.org/"> terms and conditions</Link>. You'll pay
      a commission rate of 5% on sales made through Earthly App.
    </p>
  );
  // Handle connect button
  const handleAction = useCallback((e) => {
    appFetch("/api/saveconfig", {
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
  const handlePackageAction = (e) => {
    console.log(e.target.value);
    let packageInfo = e.target.value;
    appFetch("/api/saveconfig", {
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
    document.getElementsByClassName("connectionPanel")[0].style.visibility =
      "visible";
    let selectedPackaged = qresult.amount + ":" + qresult.earthlyProjectId;
    document.querySelector('[value="' + selectedPackaged + '"]').checked = true;
  }
  // Query Shop info
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
  // Render
  return (
    <Page>
      <TitleBar title="Plant Tress With EARTHLY" primaryAction={null} />
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
        <div className="connectionPanel" style={{ visibility: "hidden" }}>
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
            <Layout>
              <Layout.Section>
                <p style={{ fontSize: "16px", margin: "15px 0" }}>
                  Choose the project to support
                </p>
              </Layout.Section>
              <Layout.Section oneHalf>
                <MediaCard
                  title="Mangroves in Madagascar"
                  description="This trail-blazing project run by Eden Reforestation Projects has reforestation and poverty alleviation at its heart. Mangroves pack some punch when it comes to carbon sequestration but also provide a whole load of other natural benefits such as storm surge protection and vital habitat for many species.The Madagascar project that we support started in 2007. The project has already planted over 300 million trees and created over 3 million workdays."
                >
                  <img
                    alt=""
                    width="100%"
                    height="100%"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                    src="https://a.storyblok.com/f/128545/512x359/7c1c0f714f/orangutan-rimba-raya.png"
                  />
                </MediaCard>
                <div style={mystyle} onChange={handlePackageAction}>
                  <Badge status="success">ocean acidification control</Badge>
                  <RadioButton
                    label="$ 1"
                    helpText="1 Tree"
                    name="earthlypackage"
                    value="1:5f96f967a3a85800118be4d1"
                  />
                  <RadioButton
                    label="$ 2"
                    helpText="2 Trees"
                    name="earthlypackage"
                    value="2:5f96f967a3a85800118be4d1"
                  />
                  <RadioButton
                    label="$ 3"
                    helpText="3 Trees"
                    name="earthlypackage"
                    value="3:5f96f967a3a85800118be4d1"
                  />
                </div>
              </Layout.Section>
              <Layout.Section oneHalf>
                <MediaCard
                  title="Keo Seima"
                  description="A REDD+ project with a focus on stopping rapidly increasing deforestation in Cambodia but helping gain land rights for the Bunong People. The project began in 2010, and impacts a total of 20,000 people."
                >
                  <img
                    alt=""
                    width="100%"
                    height="100%"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                    src="https://a.storyblok.com/f/128545/640x427/5ce7a67c38/ksws-forests_adam-roberts-_3_-min-medium.jpeg"
                  />
                </MediaCard>
                <div style={mystyle} onChange={handlePackageAction}>
                  <Badge status="success">biodiversity protection</Badge>
                  <RadioButton
                    label="$ 1"
                    helpText="1 Tree"
                    name="earthlypackage"
                    value="1:601ae0006fc1d70018fef078"
                  />
                  <RadioButton
                    label="$ 2"
                    helpText="2 Trees"
                    name="earthlypackage"
                    value="2:601ae0006fc1d70018fef078"
                  />
                  <RadioButton
                    label="$ 3"
                    helpText="3 Trees"
                    name="earthlypackage"
                    value="3:601ae0006fc1d70018fef078"
                  />
                </div>
              </Layout.Section>
            </Layout>
          </Layout.Section>
        </div>
      </Layout>
    </Page>
  );
}
