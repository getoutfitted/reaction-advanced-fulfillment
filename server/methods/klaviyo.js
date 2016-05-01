Meteor.methods({
  'advancedFulfullment/createKlaviyoEvent': function (eventName, orderId) {
    check(eventName, String);
    check(orderId, String);
    const order = ReactionCore.Collections.Orders.findOne(orderId);
    if (order) {
      const billing = order.billing[0].address;
      let fullName = billing.fullName;
      let names = fullName.split(' ');
      let firstName = names[0];
      const address = billing.address2 ? `${billing.address1} ${billing.address2}` : billing.address1;
      const shipping = order.shipping[0].address;
      const shippingAddressInfo = shipping.address2 ? `${shipping.address1} ${shipping.address2}` : shipping.address1;
      let productIds = [];
      let productDescriptions = [];
      let skus = [];
      _.each(order.advancedFulfillment.items, function (item) {
        productIds.push(item.productId);
        let description = item.itemDescription || item.title;
        productDescriptions.push(description);
        skus.push(item.sku);
      });
      let klaviyo = {
        "event": eventName,
        "customer_properties": {
          "$email": order.email,
          "$first_name": firstName,
          "Full Name": billing.fullName,
          "Address": address,
          "$phone_number": billing.phone,
          "$city": billing.city,
          "$region": billing.region,
          "$zip": billing.postal,
          "$country": billing.country
        },
        "properties": {
          "Order Number": order.orderNumber,
          "$value": order.billing[0].invoice.total,
          "Taxes": order.billing[0].invoice.taxes,
          "Discount": order.billing[0].invoice.discounts,
          "Subtotal": order.billing[0].invoice.subtotal,
          "Shipping Address": shippingAddressInfo,
          "Shipping City": order.shipping[0].address.city,
          "Shipping State": order.shipping[0].address.region,
          "Shipping Country": order.shipping[0].address.country,
          "Shipping Zipcode": order.shipping[0].address.postal,
          "Arrival Day": order.advancedFulfillment.arriveBy,
          "Customer Return Date": order.advancedFulfillment.shipReturnBy,
          "Product Descriptions": productDescriptions,
          "Product Ids": productIds,
          "Product Skus": skus,
          "Shipment Date": order.advancedFulfillment.shipmentDate,
          "Return To GO By Date": order.advancedFulfillment.returnDate
        }
      };
      if (names.length > 1) {
        names.shift();
        klaviyo.customer_properties['$last_name'] = names.join(' ');
      }
      Klaviyo.trackEvent(klaviyo);
      }
    }
});
