import { RegisterInit, register } from "@shopify/web-pixels-extension";
import {
  PixelEventsCartViewed,
  PixelEventsCheckoutAddressInfoSubmitted,
  PixelEventsCheckoutCompleted,
  PixelEventsCheckoutContactInfoSubmitted,
  PixelEventsCheckoutShippingInfoSubmitted,
  PixelEventsCheckoutStarted,
  PixelEventsCollectionViewed,
  PixelEventsPageViewed,
  PixelEventsPaymentInfoSubmitted,
  PixelEventsProductAddedToCart,
  PixelEventsProductViewed,
  PixelEventsSearchSubmitted,
  PixelEventsProductRemovedFromCart
} from "node_modules/@shopify/web-pixels-extension/build/ts/types/PixelEvents";

register(({ analytics, settings, init }) => {
  // Bootstrap and insert pixel script tag here

  //cart_viewed
  analytics.subscribe('cart_viewed', (event) => {
    var cartPayload = mapCartViewed(event);
    handleEvent("cart_viewed", settings, init, cartPayload);
  });


  //checkout_address_info_submitted
  analytics.subscribe('checkout_address_info_submitted', (event) => {
    var checkoutAddressInfoMap = mapCheckoutAddressInfoSumitted(event);
    handleEvent("checkout_address_info_submitted", settings, init, checkoutAddressInfoMap);
  });

  //checkout_completed
  analytics.subscribe('checkout_completed', (event) => {
    var checkoutPayload = mapCheckoutCompleted(event);
    handleEvent("checkout_completed", settings, init, checkoutPayload);
  });

  //checkout_contact_info_submitted
  analytics.subscribe('checkout_contact_info_submitted', (event) => {
    var checkoutContactInfoMap = mapCheckoutContactInfoSubmitted(event);
    handleEvent("checkout_contact_info_submitted", settings, init, checkoutContactInfoMap);
  });

  //checkout_shipping_info_submitted
  analytics.subscribe('checkout_shipping_info_submitted', (event) => {
    var checkoutShippingInfoMap = mapCheckoutShippingInfoSubmitted(event);
    handleEvent("checkout_shipping_info_submitted", settings, init, checkoutShippingInfoMap);
  });

  //checkout_started
  analytics.subscribe('checkout_started', (event) => {
    var checkoutStartedMap = mapCheckoutStarted(event);
    handleEvent("checkout_started", settings, init, checkoutStartedMap);
  });

  //collection_viewed
  analytics.subscribe('collection_viewed', (event) => {
    var collectionPayload = mapCollectionViewed(event);
    handleEvent("collection_viewed", settings, init, collectionPayload);
  });

  //page_viewed
  analytics.subscribe('page_viewed', (event) => {
    console.log(event);
    console.log(settings);
    var pageViewedPayload = mapPageViewed(event);
    handleEvent("page_viewed", settings, init, pageViewedPayload);
  });

  //payment_info_submitted
  analytics.subscribe('payment_info_submitted', (event) => {
    var paymentInfoSubmittedPayload = mapPaymentInfoSubmitted(event);
    handleEvent("payment_info_submitted", settings, init, paymentInfoSubmittedPayload);
  });

  //product_added_to_cart
  analytics.subscribe('product_added_to_cart', (event) => {
    var productAddedToCartPayload = mapProductAddedToCart(event);
    handleEvent("product_added_to_cart", settings, init, productAddedToCartPayload);
  });

  //product_removed_from_cart
  analytics.subscribe('product_removed_from_cart', (event) => {
    var productRemovedFromCartPayload = mapProductRemovedFromCart(event);
    handleEvent("product_removed_from_cart", settings, init, productRemovedFromCartPayload);
  });

  //product_viewed
  analytics.subscribe('product_viewed', (event) => {
    var productViewedPayload = mapProductViewed(event);
    handleEvent("product_viewed", settings, init, productViewedPayload);
  });

  //search_submitted
  analytics.subscribe('search_submitted', (event) => {
    var searchSubmittedPayload = mapSearchSubmitted(event);
    handleEvent("search_submitted", settings, init, searchSubmittedPayload);
  });
});


function mapCartViewed(event: PixelEventsCartViewed) {
  return {
    sessionId: event.clientId,
    data: {
      id: event.data.cart?.id,
      totalQuantity: event.data.cart?.totalQuantity,
      cost: event.data.cart?.cost,
      lines: event.data.cart?.lines?.map((line) => {
        return {
          cost: line.cost,
          merchandise: line.merchandise,
          quantity: line.quantity
        }
      })
    }
  };
}

function mapCheckoutAddressInfoSumitted(event: PixelEventsCheckoutAddressInfoSubmitted) {
  return {
    sessionId: event.clientId,
    data: event.data
  };
}

function mapCheckoutCompleted(event: PixelEventsCheckoutCompleted) {
  return {
    sessionId: event.clientId,
    data: event.data
  };
}

function mapCheckoutContactInfoSubmitted(event: PixelEventsCheckoutContactInfoSubmitted) {
  return {
    sessionId: event.clientId,
    data: event.data
  };
}

function mapCheckoutShippingInfoSubmitted(event: PixelEventsCheckoutShippingInfoSubmitted) {
  return {
    sessionId: event.clientId,
    data: event.data
  };
}

function mapCheckoutStarted(event: PixelEventsCheckoutStarted) {
  return {
    sessionId: event.clientId,
    data: event.data
  };
}

function mapCollectionViewed(event: PixelEventsCollectionViewed) {
  return {
    sessionId: event.clientId,
    data: event.data
  };
}

function mapPageViewed(event: PixelEventsPageViewed) {
  return {
    sessionId: event.clientId,
    data: event.data
  };
}

function mapPaymentInfoSubmitted(event: PixelEventsPaymentInfoSubmitted) {
  return {
    sessionId: event.clientId,
    data: event.data
  };
}

function mapProductAddedToCart(event: PixelEventsProductAddedToCart) {
  return {
    sessionId: event.clientId,
    data: event.data
  };
}

function mapProductRemovedFromCart(event: PixelEventsProductRemovedFromCart) {
  return {
    sessionId: event.clientId,
    data: event.data
  };
}

function mapProductViewed(event: PixelEventsProductViewed) {
  return {
    sessionId: event.clientId,
    data: event.data
  };
}

function mapSearchSubmitted(event: PixelEventsSearchSubmitted) {
  return {
    sessionId: event.clientId,
    data: event.data
  };
}
function handleEvent(eventName: string, settings: Record<string, any>, init: RegisterInit, payload: any) {

  var configuration = JSON.parse(settings.data);

  var customerIoBaseUrl = configuration.customerIoBaseUrl ?? "https://track.customer.io";
  var segmentBaseUrl = configuration.segmentBaseUrl ?? "https://api.segment.io";

  if (configuration.customerIoIsEnabled && configuration.customerIoApiKey && configuration.customerIoSiteId) {
    if (configuration.customerIoEvents.includes(eventName)) {
      //send to customer io
      var customerIoHeaders = {
        "Authorization": `Basic ${btoa(configuration.customerIoSiteId + ":" + configuration.customerIoApiKey)}`,
        "Content-Type": "application/json",
      };

      if (!init.data.customer) {

        fetch(customerIoBaseUrl + `/api/v1/events`, {
          method: "POST",
          body: JSON.stringify({
            name: eventName,
            data: payload.data,
            anonymous_id: payload.sessionId
          }),
          headers: customerIoHeaders,
        });
      }
      else {
        fetch(customerIoBaseUrl + `/api/v1/customers/${init.data.customer.id}/events`, {
          method: "POST",
          body: JSON.stringify({
            name: eventName,
            data: payload.data
          }),
          headers: customerIoHeaders
        });
      }
    }

    //segment
    if (configuration.segmentIsEnabled && configuration.segmentWriteKey && init.data.customer)
      if (configuration.segmentEvents.includes(eventName)) {
        //send to segment
        fetch(segmentBaseUrl + "/v1/track", {
          method: "POST",
          body: JSON.stringify({
            userId: init.data.customer.id,
            event: eventName,
            properties: payload.data
          }),
          headers: {
            "Authorization": `Basic ${btoa(configuration.segmentWriteKey + ":")}`,
            "Content-Type": "application/json",
          },
        });
      }
  }
}
