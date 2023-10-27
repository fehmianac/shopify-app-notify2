(() => {
  // node_modules/@shopify/web-pixels-extension/build/esm/globals.mjs
  var EXTENSION_POINT = "WebPixel::Render";

  // node_modules/@shopify/web-pixels-extension/build/esm/register.mjs
  var register = (extend) => shopify.extend(EXTENSION_POINT, extend);

  // extensions/event-dispatcher/src/index.ts
  register(({ analytics, settings, browser }) => {
    analytics.subscribe("cart_viewed", (event) => {
      var cartPayload = mapCartViewed(event);
      handleEvent("cart_viewed", settings, cartPayload);
    });
    analytics.subscribe("checkout_address_info_submitted", (event) => {
      var checkoutAddressInfoMap = mapCheckoutAddressInfoSumitted(event);
      handleEvent("checkout_address_info_submitted", settings, checkoutAddressInfoMap);
    });
    analytics.subscribe("checkout_completed", (event) => {
      var checkoutPayload = mapCheckoutCompleted(event);
      handleEvent("checkout_completed", settings, checkoutPayload);
    });
    analytics.subscribe("checkout_contact_info_submitted", (event) => {
      var checkoutContactInfoMap = mapCheckoutContactInfoSubmitted(event);
      handleEvent("checkout_contact_info_submitted", settings, checkoutContactInfoMap);
    });
    analytics.subscribe("checkout_shipping_info_submitted", (event) => {
      var checkoutShippingInfoMap = mapCheckoutShippingInfoSubmitted(event);
      handleEvent("checkout_shipping_info_submitted", settings, checkoutShippingInfoMap);
    });
    analytics.subscribe("checkout_started", (event) => {
      var checkoutStartedMap = mapCheckoutStarted(event);
      handleEvent("checkout_started", settings, checkoutStartedMap);
    });
    analytics.subscribe("collection_viewed", (event) => {
      var collectionPayload = mapCollectionViewed(event);
      handleEvent("collection_viewed", settings, collectionPayload);
    });
    analytics.subscribe("page_viewed", (event) => {
      console.log(event);
      console.log(settings);
      var pageViewedPayload = mapPageViewed(event);
      handleEvent("page_viewed", settings, pageViewedPayload);
    });
    analytics.subscribe("payment_info_submitted", (event) => {
      var paymentInfoSubmittedPayload = mapPaymentInfoSubmitted(event);
      handleEvent("payment_info_submitted", settings, paymentInfoSubmittedPayload);
    });
    analytics.subscribe("product_added_to_cart", (event) => {
      var productAddedToCartPayload = mapProductAddedToCart(event);
      handleEvent("product_added_to_cart", settings, productAddedToCartPayload);
    });
    analytics.subscribe("product_removed_from_cart", (event) => {
      var productRemovedFromCartPayload = mapProductRemovedFromCart(event);
      handleEvent("product_removed_from_cart", settings, productRemovedFromCartPayload);
    });
    analytics.subscribe("product_viewed", (event) => {
      var productViewedPayload = mapProductViewed(event);
      handleEvent("product_viewed", settings, productViewedPayload);
    });
    analytics.subscribe("search_submitted", (event) => {
      var searchSubmittedPayload = mapSearchSubmitted(event);
      handleEvent("search_submitted", settings, searchSubmittedPayload);
    });
  });
  function mapCartViewed(event) {
    var _a, _b, _c, _d, _e;
    return {
      customerId: event.clientId,
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
      customerId: event.clientId,
      data: event.data
    };
  }
  function mapCheckoutCompleted(event) {
    return {
      customerId: event.clientId,
      data: event.data
    };
  }
  function mapCheckoutContactInfoSubmitted(event) {
    return {
      customerId: event.clientId,
      data: event.data
    };
  }
  function mapCheckoutShippingInfoSubmitted(event) {
    return {
      customerId: event.clientId,
      data: event.data
    };
  }
  function mapCheckoutStarted(event) {
    return {
      customerId: event.clientId,
      data: event.data
    };
  }
  function mapCollectionViewed(event) {
    return {
      customerId: event.clientId,
      data: event.data
    };
  }
  function mapPageViewed(event) {
    return {
      customerId: event.clientId,
      data: event.data
    };
  }
  function mapPaymentInfoSubmitted(event) {
    return {
      customerId: event.clientId,
      data: event.data
    };
  }
  function mapProductAddedToCart(event) {
    return {
      customerId: event.clientId,
      data: event.data
    };
  }
  function mapProductRemovedFromCart(event) {
    return {
      customerId: event.clientId,
      data: event.data
    };
  }
  function mapProductViewed(event) {
    return {
      customerId: event.clientId,
      data: event.data
    };
  }
  function mapSearchSubmitted(event) {
    return {
      customerId: event.clientId,
      data: event.data
    };
  }
  function handleEvent(eventName, settings, payload) {
    var _a, _b;
    var customerIoBaseUrl = (_a = settings.customerIoBaseUrl) != null ? _a : "https://track.customer.io";
    var segmentBaseUrl = (_b = settings.segmentBaseUrl) != null ? _b : "https://api.segment.io";
    if (settings.customerIoIsEnabled && settings.customerIoApiKey && settings.customerIoSiteId) {
      if (settings.customerIoEvents.includes(eventName)) {
        fetch(customerIoBaseUrl + `/api/v1/customers/${payload.customerId}/events`, {
          body: JSON.stringify(payload.data),
          headers: {
            "Authorization": `Basic ${btoa(settings.customerIoSiteId + ":" + settings.customerIoApiKey)}`,
            "Content-Type": "application/json"
          }
        });
      }
    }
    if (settings.segmentIsEnabled && settings.segmentWriteKey) {
      if (settings.segmentEvents.includes(eventName)) {
        fetch(segmentBaseUrl + "/v1/track", {
          body: JSON.stringify({
            userId: payload.customerId,
            event: eventName,
            properties: payload.data
          }),
          headers: {
            "Authorization": `Basic ${btoa(settings.segmentWriteKey + ":")}`,
            "Content-Type": "application/json"
          }
        });
      }
    }
  }
})();
