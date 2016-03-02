ReactionCore.MethodHooks.after('cart/copyCartToOrder', function (options) {
  const orderId = options.result || arguments[0];
  const order = ReactionCore.Collections.Orders.findOne(orderId);
  const items = order.items;
  const afPackage = ReactionCore.Collections.Packages.findOne({
    name: 'reaction-advanced-fulfillment',
    shopId: ReactionCore.getShopId()
  });
  if (!afPackage || !afPackage.settings || !afPackage.settings.buffer) {
    return orderId;
  }

  const shippingAddress = AdvancedFulfillment.addressFormatForFedExApi(order.shipping[0].address);
  const localDelivery = AdvancedFulfillment.determineLocalDelivery(order.shipping[0].address.postal);
  let transitTime;
  localDelivery ? transitTime = 0 : transitTime  = AdvancedFulfillment.FedExApi.getFedexTransitTime(shippingAddress);
  // MOCKING OUR START TIME and END TIME
  order.startTime = new Date (2016, 2, 15); // Tue March 15, 2015

  let arrivalDate = AdvancedFulfillment.date.determineArrivalDate(order.startTime);
  let shipmentDate = AdvancedFulfillment.date.determineShipmentDate(arrivalDate, transitTime);

  // if (!order.startTime) {
  //   arrivalDate = 'TODO';
  // }

  let afItems = _.map(itemList, function (item) {
    return {
      _id: item._id,
      productId: item.productId,
      shopId: item.shopId,
      quantity: item.quantity,
      variantId: item.variants._id,
      itemDescription: item.variants.title,
      workflow: {
        status: 'In Stock',
        workflow: []
      },
      price: item.variants.price,
      sku: item.variants.sku,
      location: item.variants.location
    };
  });
  ReactionCore.Collections.Orders.update({_id: orderId}, {
    $set: {
      'advancedFulfillment.workflow.status': 'orderCreated',
      'advancedFulfillment.workflow.workflow': [],
      'advancedFulfillment.transitTime': transitTime,
      'advancedFulfillment.localDelivery': localDelivery,
      'advancedFulfillment.items': afItems,
      'advancedFulfillment.arriveBy': arrivalDate
    }
  });
  return orderId;
});

