(() => {
  // node_modules/@shopify/web-pixels-extension/build/esm/globals.mjs
  var EXTENSION_POINT = "WebPixel::Render";

  // node_modules/@shopify/web-pixels-extension/build/esm/register.mjs
  var register = (extend) => shopify.extend(EXTENSION_POINT, extend);

  // extensions/event-dispatcher/src/index.ts
  register(({ analytics, settings, init }) => {
    analytics.subscribe("cart_viewed", (event) => {
      var cartPayload = mapCartViewed(event);
      handleEvent("cart_viewed", settings, init, cartPayload);
    });
    analytics.subscribe("checkout_address_info_submitted", (event) => {
      var checkoutAddressInfoMap = mapCheckoutAddressInfoSumitted(event);
      handleEvent("checkout_address_info_submitted", settings, init, checkoutAddressInfoMap);
    });
    analytics.subscribe("checkout_completed", (event) => {
      var checkoutPayload = mapCheckoutCompleted(event);
      handleEvent("checkout_completed", settings, init, checkoutPayload);
    });
    analytics.subscribe("checkout_contact_info_submitted", (event) => {
      var checkoutContactInfoMap = mapCheckoutContactInfoSubmitted(event);
      handleEvent("checkout_contact_info_submitted", settings, init, checkoutContactInfoMap);
    });
    analytics.subscribe("checkout_shipping_info_submitted", (event) => {
      var checkoutShippingInfoMap = mapCheckoutShippingInfoSubmitted(event);
      handleEvent("checkout_shipping_info_submitted", settings, init, checkoutShippingInfoMap);
    });
    analytics.subscribe("checkout_started", (event) => {
      var checkoutStartedMap = mapCheckoutStarted(event);
      handleEvent("checkout_started", settings, init, checkoutStartedMap);
    });
    analytics.subscribe("collection_viewed", (event) => {
      var collectionPayload = mapCollectionViewed(event);
      handleEvent("collection_viewed", settings, init, collectionPayload);
    });
    analytics.subscribe("page_viewed", (event) => {
      console.log(event);
      console.log(settings);
      var pageViewedPayload = mapPageViewed(event);
      handleEvent("page_viewed", settings, init, pageViewedPayload);
    });
    analytics.subscribe("payment_info_submitted", (event) => {
      var paymentInfoSubmittedPayload = mapPaymentInfoSubmitted(event);
      handleEvent("payment_info_submitted", settings, init, paymentInfoSubmittedPayload);
    });
    analytics.subscribe("product_added_to_cart", (event) => {
      var productAddedToCartPayload = mapProductAddedToCart(event);
      handleEvent("product_added_to_cart", settings, init, productAddedToCartPayload);
    });
    analytics.subscribe("product_removed_from_cart", (event) => {
      var productRemovedFromCartPayload = mapProductRemovedFromCart(event);
      handleEvent("product_removed_from_cart", settings, init, productRemovedFromCartPayload);
    });
    analytics.subscribe("product_viewed", (event) => {
      var productViewedPayload = mapProductViewed(event);
      handleEvent("product_viewed", settings, init, productViewedPayload);
    });
    analytics.subscribe("search_submitted", (event) => {
      var searchSubmittedPayload = mapSearchSubmitted(event);
      handleEvent("search_submitted", settings, init, searchSubmittedPayload);
    });
  });
  function mapCartViewed(event) {
    var _a, _b, _c, _d, _e;
    return {
      sessionId: event.clientId,
      data: {
        id: (_a = event.data.cart) == null ? void 0 : _a.id,
        totalQuantity: (_b = event.data.cart) == null ? void 0 : _b.totalQuantity,
        cost: (_c = event.data.cart) == null ? void 0 : _c.cost,
        lines: (_e = (_d = event.data.cart) == null ? void 0 : _d.lines) == null ? void 0 : _e.map((line) => {
          return {
            cost: line.cost,
            merchandise: line.merchandise,
            quantity: line.quantity
          };
        })
      }
    };
  }
  function mapCheckoutAddressInfoSumitted(event) {
    return {
      sessionId: event.clientId,
      data: event.data
    };
  }
  function mapCheckoutCompleted(event) {
    return {
      sessionId: event.clientId,
      data: event.data
    };
  }
  function mapCheckoutContactInfoSubmitted(event) {
    return {
      sessionId: event.clientId,
      data: event.data
    };
  }
  function mapCheckoutShippingInfoSubmitted(event) {
    return {
      sessionId: event.clientId,
      data: event.data
    };
  }
  function mapCheckoutStarted(event) {
    return {
      sessionId: event.clientId,
      data: event.data
    };
  }
  function mapCollectionViewed(event) {
    return {
      sessionId: event.clientId,
      data: event.data
    };
  }
  function mapPageViewed(event) {
    return {
      sessionId: event.clientId,
      data: event.data
    };
  }
  function mapPaymentInfoSubmitted(event) {
    return {
      sessionId: event.clientId,
      data: event.data
    };
  }
  function mapProductAddedToCart(event) {
    return {
      sessionId: event.clientId,
      data: event.data
    };
  }
  function mapProductRemovedFromCart(event) {
    return {
      sessionId: event.clientId,
      data: event.data
    };
  }
  function mapProductViewed(event) {
    return {
      sessionId: event.clientId,
      data: event.data
    };
  }
  function mapSearchSubmitted(event) {
    return {
      sessionId: event.clientId,
      data: event.data
    };
  }
  function handleEvent(eventName, settings, init, payload) {
    var _a, _b;
    var configuration = JSON.parse(settings.data);
    var customerIoBaseUrl = (_a = configuration.customerIoBaseUrl) != null ? _a : "https://track.customer.io";
    var segmentBaseUrl = (_b = configuration.segmentBaseUrl) != null ? _b : "https://api.segment.io";
    if (configuration.customerIoIsEnabled && configuration.customerIoApiKey && configuration.customerIoSiteId) {
      if (configuration.customerIoEvents.includes(eventName)) {
        var customerIoHeaders = {
          "Authorization": `Basic ${btoa(configuration.customerIoSiteId + ":" + configuration.customerIoApiKey)}`,
          "Content-Type": "application/json"
        };
        if (!init.data.customer) {
          fetch(customerIoBaseUrl + `/api/v1/events`, {
            method: "POST",
            body: JSON.stringify({
              name: eventName,
              data: payload.data,
              anonymous_id: payload.sessionId
            }),
            headers: customerIoHeaders
          });
        } else {
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
      if (configuration.segmentIsEnabled && configuration.segmentWriteKey && init.data.customer) {
        if (configuration.segmentEvents.includes(eventName)) {
          fetch(segmentBaseUrl + "/v1/track", {
            method: "POST",
            body: JSON.stringify({
              userId: init.data.customer.id,
              event: eventName,
              properties: payload.data
            }),
            headers: {
              "Authorization": `Basic ${btoa(configuration.segmentWriteKey + ":")}`,
              "Content-Type": "application/json"
            }
          });
        }
      }
    }
  }
})();
