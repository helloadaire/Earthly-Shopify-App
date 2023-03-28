import { useNavigate, TitleBar, Loading } from "@shopify/app-bridge-react";
import {
  Card,
  EmptyState,
  Layout,
  Page,
  SkeletonBodyText,
} from "@shopify/polaris";
import { QRCodeIndex } from "../components";
export default function HomePage() {
  /*
    Add an App Bridge useNavigate hook to set up the navigate function.
    This function modifies the top-level browser URL so that you can
    navigate within the embedded app and keep the browser in sync on reload.
  */
  const navigate = useNavigate();

  /*
    These are mock values. Setting these values lets you preview the loading markup and the empty state.
  */
  const isLoading = false;
  const isRefetching = false;
  const QRCodes = [];

  /* loadingMarkup uses the loading component from AppBridge and components from Polaris  */
  const loadingMarkup = isLoading ? (
    <Card sectioned>
      <Loading />
      <SkeletonBodyText />
    </Card>
  ) : null;

  /* Use Polaris Card and EmptyState components to define the contents of the empty state */
  const emptyStateMarkup =
     (
      <Card sectioned>
        <EmptyState
          heading="Build trust. Inspire loyalty. Save the Earth."
          /* This button will take the user to a Create a QR code page */
          action={{
            content: "Learn More",
            onAction: () => navigate("/#"),
          }}
          image="earthly.jpg"
        >
          <p class="ssv">
            With every reward you can support nature-based solutions that remove carbon, restore biodiversity, and support social programs that improve the livelihoods of local communities. It’s a simple and effective addition to your rewards program that will inspire your community and support your ESG goals.
          </p>
		  
        </EmptyState>
      </Card>
    )

  /*
    Use Polaris Page and TitleBar components to create the page layout,
    and include the empty state contents set above.
  */
  return (
    <Page>
      <TitleBar
        title="Earthly"
        primaryAction={{
          content: "About Earthly",
          onAction: () => navigate("/qrcodes/new"),
        }}
      />
      <Layout>
        <Layout.Section>
          {loadingMarkup}
          {emptyStateMarkup}
        </Layout.Section>
      </Layout>
    </Page>
  );
}

