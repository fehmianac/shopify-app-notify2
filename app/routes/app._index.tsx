import { useCallback, useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  VerticalStack,
  Card,
  Button,
  HorizontalStack,
  Link,
  TextField,
  Combobox,
  Listbox,
  Grid,
  LegacyCard,
  Checkbox,
  OptionList,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";

let webHookList = [
  "CARTS_CREATE",
  "CARTS_UPDATE",
  "CUSTOMERS_CREATE",
  "CUSTOMERS_DELETE",
  "CUSTOMERS_DISABLE",
  "CUSTOMERS_ENABLE",
  "CUSTOMERS_UPDATE",
  "ORDERS_CREATE",
];


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  
  try {
    var response = await admin.graphql(
      `#graphql
      query webPixel {
        webPixel {
          id
          settings
        }
      }
      `
    )
    var jsonResponse = await response.json();
    var data = JSON.parse(JSON.parse(jsonResponse.data.webPixel.settings).data);
    return json({
      settings: data,
      id: jsonResponse.data.webPixel.id
    });

  }
  catch (error) {
    console.log(error);
    return json({
      id: null
    });
  }


};

export const action = async ({ request }: ActionFunctionArgs) => {

  //How is get any better than this?
  //All of life comes to me with ease, joy and glory
  //All of money comes to me with ease, joy and glory
  const { admin } = await authenticate.admin(request);
  var storeInfo = await admin.rest.get({
    path: "shop.json",
  });
  var formData = await request.formData();
  var segmentValue = JSON.parse(formData.get("segmentValue") as string);
  var customerIoValue = JSON.parse(formData.get("customerIoValue") as string);
  var isCreatedBefore = JSON.parse(formData.get("isCreatedBefore") as string);
  console.log(isCreatedBefore);
  var status = 200;
  if (isCreatedBefore == true) {
    var id = JSON.parse(formData.get("webPixelId") as string);
    var response = await admin.graphql(
      `#graphql
      mutation webPixelUpdate($id: ID!, $webPixel: WebPixelInput!) {
        webPixelUpdate(id: $id, webPixel: $webPixel) {
          userErrors {
            field
            message
          }
          webPixel {
            settings
          }
        }
      }
      `  , {
      variables: {
        id: id,
        webPixel: {
          settings: {
            data: JSON.stringify({
              "customerIoBaseUrl": customerIoValue.baseUrl,
              "customerIoSiteId": customerIoValue.siteId,
              "customerIoApiKey": customerIoValue.apiKey,
              "customerIoEvents": customerIoValue.events,
              "customerIoIsEnabled": customerIoValue,
              "segmentBaseUrl": segmentValue.baseUrl,
              "segmentWriteKey": segmentValue.writeKey,
              "segmentEvents": segmentValue.events,
              "segmentIsEnabled": segmentValue.isEnabled
            })
          }
        }
      }
    }
    );

    status = response.status;

  } else {
    var response = await admin.graphql(
      `#graphql
      mutation webPixelCreate($webPixel: WebPixelInput!) {
        webPixelCreate(webPixel: $webPixel) {
          userErrors {
            code
            field
            message
          }
          webPixel {
            settings
            id
          }
        }
      }
      ` , {
      variables: {
        webPixel: {
          settings: {
            data: JSON.stringify({
              "customerIoBaseUrl": customerIoValue.baseUrl,
              "customerIoSiteId": customerIoValue.siteId,
              "customerIoApiKey": customerIoValue.apiKey,
              "customerIoEvents": customerIoValue.events,
              "customerIoIsEnabled": customerIoValue,
              "segmentBaseUrl": segmentValue.baseUrl,
              "segmentWriteKey": segmentValue.writeKey,
              "segmentEvents": segmentValue.events,
              "segmentIsEnabled": segmentValue.isEnabled
            })
          }
        }
      },
    }
    );
    status = response.status;
  }
  var webhookUrl = "https://webhook.notifyto.com/shopify/webhooks?1=1";
  if (customerIoValue.isEnabled) {
    webhookUrl += "&CISID=" + customerIoValue.siteId + "&CIAK=" + customerIoValue.apiKey + "&CIR=" + customerIoValue.baseUrl;
  }
  if (segmentValue.isEnabled) {
    webhookUrl += "&SWK=" + segmentValue.writeKey + "&SR=" + segmentValue.baseUrl;
  }

  //Get all webhooks
  var allWebhooks = await admin.rest.get({
    path: "admin/api/2021-07/webhooks.json",
  });

  var allWebhooksJson = await allWebhooks.json();
  console.log(allWebhooksJson)


  //Delete all webhooks
  for (let webhook of allWebhooksJson.webhooks) {
    var deleteWebhookResponse = await admin.rest.delete({
      path: `admin/api/2021-07/webhooks/${webhook.id}.json`,
    });
  }

  for (let webhook of webHookList) {
    var webhookSubscriptionResponse = await admin.graphql(
      `#graphql
        mutation {
          webhookSubscriptionCreate(
            topic: ${webhook},
            webhookSubscription:{
              format: JSON,
              callbackUrl: "${webhookUrl}"}
          ) {
            userErrors {
              field
              message
            }
            webhookSubscription {
              id
            }
          }
        }
        `
    );
    var jsonResponse = await webhookSubscriptionResponse.json();
    console.log(jsonResponse.data.webhookSubscriptionCreate.userErrors);

  }

  return json({
    status: status

  });
};

let allEvents = [
  "cart_viewed",
  "checkout_address_info_submitted",
  "checkout_completed",
  "checkout_contact_info_submitted",
  "checkout_shipping_info_submitted",
  "checkout_started",
  "collection_viewed",
  "page_viewed",
  "payment_info_submitted",
  "product_added_to_cart",
  "product_removed_from_cart",
  "product_viewed",
  "search_submitted"
];


export default function Index() {
  const nav = useNavigation();
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const isLoading = ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  const [isCreatedBefore, setisCreatedBefore] = useState(false);
  const [webPixelId, setWebPixelId] = useState(null);
  const [segmentValue, setSegmentValue] = useState({
    "baseUrl": "https://api.segment.io",
    "baseUrlInputValue": "Oregon (Default)",
    "writeKey": "",
    "isEnabled": true,
    "events": allEvents
  });


  const [customerIoValue, setCustomerIoValue] = useState({
    "baseUrl": "https://track.customer.io",
    "baseUrlInputValue": "US",
    "siteId": "",
    "apiKey": "",
    "isEnabled": true,
    "events": allEvents
  });

  useEffect(() => {
    if (actionData?.status == 200) {
      shopify.toast.show("Successfully saved configuration", { duration: 5000, isError: false });
    }

  }, [actionData?.status])

  useEffect(() => {
    if (!loaderData.settings) {
      return;
    }
    setWebPixelId(loaderData?.id);
    setisCreatedBefore(true);
    var segmentSeletectedRegion = segmentApiBaseUrlOptions.find((option) => {
      return option.value.match(loaderData?.settings.segmentBaseUrl);
    });
    setSegmentValue({
      "baseUrl": loaderData?.settings.segmentBaseUrl,
      "baseUrlInputValue": segmentSeletectedRegion?.label || '',
      "writeKey": loaderData?.settings.segmentWriteKey,
      "isEnabled": loaderData?.settings.segmentIsEnabled,
      "events": loaderData?.settings.segmentEvents
    });

    var customerIOSeletectedRegion = customerIoApiBaseUrlOptions.find((option) => {
      return option.value.match(loaderData?.settings.customerIoBaseUrl);
    });
    setCustomerIoValue({
      baseUrl: loaderData?.settings.customerIoBaseUrl,
      baseUrlInputValue: customerIOSeletectedRegion?.label || '',
      siteId: loaderData?.settings.customerIoSiteId,
      apiKey: loaderData?.settings.customerIoApiKey,
      isEnabled: loaderData?.settings.customerIoIsEnabled,
      events: loaderData?.settings.customerIoEvents
    });



  }, [loaderData?.settings]);
  const onSubmit = () => {
    const formData = new FormData();
    formData.append("isCreatedBefore", JSON.stringify(isCreatedBefore))
    formData.append("segmentValue", JSON.stringify(segmentValue));
    formData.append("customerIoValue", JSON.stringify(customerIoValue));
    formData.append("webPixelId", JSON.stringify(webPixelId));
    submit(formData, { replace: true, method: "POST", });
  }

  let allEventsItems = allEvents.map((item) => {
    return { label: item.replace("_", " ").replace("_", " ").replace("_", " "), value: item }
  });

  let segmentApiBaseUrlOptions = [{ "label": "Oregon (Default) ", "value": "https://api.segment.io" }, { "label": "Dublin", "value": "https://events.eu1.segmentapis.com" }];
  let segmentApiBaseUrlOptionsItems = segmentApiBaseUrlOptions.map((item) => {
    return <Listbox.Option value={item.value} key={item.value} selected={segmentValue.baseUrl === item.value} accessibilityLabel={item.label}>{item.label}</Listbox.Option>
  });

  let customerIoApiBaseUrlOptions = [{ "label": "US", "value": "https://track.customer.io" }, { "label": "EU", "value": "https://track-eu.customer.io" }];
  let customerIoApiBaseUrlOptionsItems = customerIoApiBaseUrlOptions.map((item) => {
    return <Listbox.Option value={item.value} key={item.value} selected={segmentValue.baseUrl === item.value} accessibilityLabel={item.label}>{item.label}</Listbox.Option>
  });

  const updateSegmentBaseUrlSelection = useCallback(
    (selected: string) => {
      const matchedOption = segmentApiBaseUrlOptions.find((option) => {
        return option.value.match(selected);
      });
      setSegmentValue({ ...segmentValue, baseUrl: selected, baseUrlInputValue: (matchedOption && matchedOption.label) || '' })
    },
    [segmentApiBaseUrlOptions],
  );

  const updateCustomerIOBaseUrlSelection = useCallback(
    (selected: string) => {
      const matchedOption = customerIoApiBaseUrlOptions.find((option) => {
        return option.value.match(selected);
      });
      setCustomerIoValue({ ...customerIoValue, baseUrl: selected, baseUrlInputValue: (matchedOption && matchedOption.label) || '' })
    },
    [customerIoApiBaseUrlOptions],
  );
  return (
    <Page>
      <ui-title-bar title="Welcome to Notify2 App">
      </ui-title-bar>
      <VerticalStack gap="5">
        <Layout>
          <Layout.Section>
            <Card>
              <VerticalStack gap="5">
                <VerticalStack gap="2">
                  <Text as="h2" variant="headingMd">
                    Congrats you have successfully installed Notify2 App
                  </Text>
                  <Text variant="bodyMd" as="p">
                    With Notify2, you can effortlessly send customer event data to <Link url="https://segment.com" target="_blank">Segment.com</Link> and <Link url="https://customer.io" target="_blank">Customer.io</Link> This integration empowers you to supercharge your marketing targeting for more effective campaigns.
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Simply set your access tokens on the app's settings page, and you're ready to go!
                  </Text>
                </VerticalStack>
                <VerticalStack gap="2">
                  <Text as="h3" variant="headingMd">
                    Let's get started by configuring the app
                  </Text>
                  <Grid>
                    <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                      <LegacyCard title="Segment.com Settings" sectioned>
                        <Combobox
                          activator={
                            <Combobox.TextField
                              label="Segment API Region"
                              value={segmentValue.baseUrlInputValue}
                              placeholder="Select Segment API Region"
                              requiredIndicator={true}
                              autoComplete="off"
                            />
                          }>
                          {segmentApiBaseUrlOptions.length > 0 ? (
                            <Listbox onSelect={updateSegmentBaseUrlSelection} >{segmentApiBaseUrlOptionsItems}</Listbox>
                          ) : null}
                        </Combobox>

                        <TextField value={segmentValue.writeKey} label="Segment Write Key" requiredIndicator={true} onChange={() => {
                          setSegmentValue({ ...segmentValue, writeKey: event.target.value })
                        }} helpText={
                          <span>
                            <Link url="https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/quickstart/#step-1-copy-your-write-key" target="_blank">Learn how to find your Segment Write Key</Link>
                          </span>
                        }>

                        </TextField>

                        <Checkbox
                          label="Enable Segment.com Integration"
                          checked={segmentValue.isEnabled}
                          onChange={() => {
                            setSegmentValue({ ...segmentValue, isEnabled: !segmentValue.isEnabled })
                          }}></Checkbox>

                        {segmentValue.isEnabled && <OptionList
                          title="Select Events to Send to Segment"
                          onChange={(value) => { setSegmentValue({ ...segmentValue, events: value }) }}
                          options={allEventsItems}
                          selected={segmentValue.events}
                          allowMultiple
                        />}

                      </LegacyCard>
                    </Grid.Cell>

                    <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                      <LegacyCard title="Customer.io Settings" sectioned>
                        <Combobox
                          activator={
                            <Combobox.TextField
                              label="CustomerIo API Region"
                              value={customerIoValue.baseUrlInputValue}
                              placeholder="Select CustomerIo API Region"
                              autoComplete="off"
                              requiredIndicator={true}
                            />
                          }>
                          {customerIoApiBaseUrlOptions.length > 0 ? (
                            <Listbox onSelect={updateCustomerIOBaseUrlSelection} >{customerIoApiBaseUrlOptionsItems}</Listbox>
                          ) : null}
                        </Combobox>

                        <TextField value={customerIoValue.siteId} label="Site Id" requiredIndicator={true} onChange={() => {
                          setCustomerIoValue({ ...customerIoValue, siteId: event.target.value })
                        }} helpText={
                          <span>

                          </span>
                        }>
                        </TextField>

                        <TextField value={customerIoValue.apiKey} label="Api Key" requiredIndicator={true} onChange={() => {
                          setCustomerIoValue({ ...customerIoValue, apiKey: event.target.value })
                        }} helpText={
                          <span>

                          </span>
                        }>
                        </TextField>

                        <Checkbox
                          label="Enable Segment.com Integration"
                          checked={customerIoValue.isEnabled}
                          onChange={() => {
                            setCustomerIoValue({ ...customerIoValue, isEnabled: !customerIoValue.isEnabled })
                          }}></Checkbox>

                        {customerIoValue.isEnabled && <OptionList
                          title="Select Events to Send to Segment"
                          onChange={(value) => { setCustomerIoValue({ ...customerIoValue, events: value }) }}
                          options={allEventsItems}
                          selected={customerIoValue.events}
                          allowMultiple
                        />}
                      </LegacyCard>
                    </Grid.Cell>
                  </Grid>

                </VerticalStack>
                <HorizontalStack gap="3" align="end">
                  <Button loading={isLoading} primary onClick={onSubmit}>
                    Save Configuration
                  </Button>
                </HorizontalStack>
              </VerticalStack>
            </Card>
          </Layout.Section>
        </Layout>
      </VerticalStack>
    </Page >
  );
}
