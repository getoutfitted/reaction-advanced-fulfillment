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

  let transitTime = localDelivery ? 0 : AdvancedFulfillment.FedExApi.getFedexTransitTime(shippingAddress);
  if (transitTime === false) {
    transitTime = afPackage.settings.buffer.shipping; // If no fedEx setting to general date
  }
  // localDelivery ? transitTime = 0 : transitTime  = AdvancedFulfillment.FedExApi.getFedexTransitTime(shippingAddress);

  // MOCKING OUR START TIME and END TIME
  order.startTime = new Date (2016, 2, 15); // Tue March 15, 2015
  order.endTime = new Date(2016, 2, 25); // Friday March 25

  let arrivalDate = AdvancedFulfillment.date.determineArrivalDate(order.startTime);
  let shipReturnBy = AdvancedFulfillment.date.determineShipReturnByDate(order.endTime);
  let shipmentDate = AdvancedFulfillment.date.determineShipmentDate(arrivalDate, transitTime);
  let afItems = AdvancedFulfillment.itemsToAFItems(items);
  ReactionCore.Collections.Orders.update({_id: orderId}, {
    $set: {
      'advancedFulfillment.workflow.status': 'orderCreated',
      'advancedFulfillment.workflow.workflow': [],
      'advancedFulfillment.transitTime': transitTime,
      'advancedFulfillment.localDelivery': localDelivery,
      'advancedFulfillment.items': afItems,
      'advancedFulfillment.arriveBy': arrivalDate,
      'advancedFulfillment.shipmentDate': shipmentDate,
      'advancedFulfillment.shipReturnBy': shipReturnBy
    }
  });
  return orderId;
});

