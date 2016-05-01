ReactionCore.MethodHooks.after('cart/copyCartToOrder', function (options) {
  const orderId = options.result || options.arguments[0];
  const order = ReactionCore.Collections.Orders.findOne(orderId);
  const afPackage = ReactionCore.Collections.Packages.findOne({
    name: 'reaction-advanced-fulfillment',
    shopId: ReactionCore.getShopId()
  });

  let af = {};
  advancedFulfillment = af.advancedFulfillment = {};
  advancedFulfillment.workflow = {
    status: 'orderCreated',
    workflow: []
  };

  const shippingAddress = TransitTimes.formatAddress(order.shipping[0].address); // XXX: do we need this?
  // check if local delivery
  advancedFulfillment.localDelivery = TransitTimes.isLocalDelivery(shippingAddress.postal);
  advancedFulfillment.items = AdvancedFulfillment.itemsToAFItems(order.items);

  let orderHasNoRentals = _.every(order.items, function (item) {
    return item.variants.functionalType === 'variant';
  });

  if (orderHasNoRentals) {
    let today = new Date();
    advancedFulfillment.shipmentDate = TransitTimes.date.nextBusinessDay(today);
  } else {
    if (!order.startTime || !order.endTime) {
      ReactionCore.Log.error(`Order: ${order._id} came through without a start or end time`);
      // Log CS Issue and Report to Dev Team
    }

    af.startTime = order.startTime;
    af.endTime = order.endTime;

    advancedFulfillment.arriveBy = order.startTime;
    advancedFulfillment.shipReturnBy = order.endTime;
    advancedFulfillment.shipmentDate = TransitTimes.calculateShippingDayByOrder(order);
    advancedFulfillment.returnDate = TransitTimes.calculateReturnDayByOrder(order);
  }
  // Let's abstract the order number parts of this to a standalone package
  af.orderNumber = AdvancedFulfillment.findAndUpdateNextOrderNumber();

  try {
    ReactionCore.Collections.Orders.update({
      _id: orderId
    }, {
      $set: af
    });
  } catch (error) {
    af.orderNumber = AdvancedFulfillment.findHighestOrderNumber();
    ReactionCore.Collections.Orders.update({
      _id: orderId
    }, {
      $set: af
    });
  }
  // Shipstation Utilization
  if (afPackage.settings.shipstation) {
    AdvancedFulfillment.Shipstation.createOrder(orderId);
    ReactionCore.Log.info(`AdvancedFulfillment pushed order ${af.orderNumber} to ShipStation`);
  }
  // Klaviyo Integration
  if (afPackage.settings.klaviyo && order.email) {
    Meteor.call('advancedFulfullment/createKlaviyoEvent', 'Checkout', orderId);
    // const billing = order.billing[0].address;
    // let fullName = billing.fullName;
    // let names = fullName.split(' ');
    // let firstName = names[0];
    // const address = billing.address2 ? `${billing.address1} ${billing.address2}` : billing.address1;
    // const shipping = order.shipping[0].address;
    // const shippingAddressInfo = shipping.address2 ? `${shipping.address1} ${shipping.address2}` : shipping.address1;
    // let productIds = [];
    // let productDescriptions = [];
    // let skus = [];
    // _.each(af.advancedFulfillment.items, function (item) {
    //   productIds.push(item.productId);
    //   let description = item.itemDescription || item.title;
    //   productDescriptions.push(description);
    //   skus.push(item.sku);
    // });
    // let klaviyo = {
    //   "event": "Checkout",
    //   "customer_properties": {
    //     "$email": order.email,
    //     "$first_name": firstName,
    //     "Full Name": billing.fullName,
    //     "Address": address,
    //     "$phone_number": billing.phone,
    //     "$city": billing.city,
    //     "$region": billing.region,
    //     "$zip": billing.postal,
    //     "country": billing.country
    //   },
    //   "properties": {
    //     "Order Number": af.orderNumber,
    //     "$value": order.billing[0].invoice.total,
    //     "Taxes": order.billing[0].invoice.taxes,
    //     "Discount": order.billing[0].invoice.discounts,
    //     "Subtotal": order.billing[0].invoice.subtotal,
    //     "Shipping Address": shippingAddressInfo,
    //     "Shipping City": order.shipping[0].address.city,
    //     "Shipping State": order.shipping[0].address.region,
    //     "Shipping Country": order.shipping[0].address.country,
    //     "Shipping Zipcode": order.shipping[0].address.postal,
    //     "Arrival Day": af.advancedFulfillment.arriveBy,
    //     "Customer Return Date": af.advancedFulfillment.shipReturnBy,
    //     "Product Descriptions": productDescriptions,
    //     "Product Ids": productIds,
    //     "Product Skus": skus,
    //     "Shipment Date": af.advancedFulfillment.shipmentDate,
    //     "Return To GO By Date": af.advancedFulfillment.returnDate
    //   }
    // };
    // if (names.length > 1) {
    //   names.shift();
    //   klaviyo.customer_properties['$last_name'] = names.join(' ');
    // }
    // Klaviyo.trackEvent(klaviyo);
  }

  return orderId;
});
