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
  let af = {};
  advancedFulfillment = af.advancedFulfillment = {};

  advancedFulfillment.workflow.status = 'orderCreated';
  advancedFulfillment.workflow.workflow = [];
  advancedFulfillment.items = AdvancedFulfillment.itemsToAFItems(items);




  const shippingAddress = AdvancedFulfillment.addressFormatForFedExApi(order.shipping[0].address);
  const localDelivery = AdvancedFulfillment.determineLocalDelivery(order.shipping[0].address.postal);

  let transitTime = localDelivery ? 0 : AdvancedFulfillment.FedExApi.getFedexTransitTime(shippingAddress);
  if (transitTime === false) {
    transitTime = afPackage.settings.buffer.shipping; // If no fedEx setting to general date
  }
  let orderHasNoRentals = _.every(order.items, function (item) {
    return item.variants.functionalType === 'variant';
  });

  if (orderHasNoRentals) {

  } else {

  }
  let arrivalDate = AdvancedFulfillment.date.determineArrivalDate(order.startTime);
  let shipReturnBy = AdvancedFulfillment.date.determineShipReturnByDate(order.endTime);
  let shipmentDate = AdvancedFulfillment.date.determineShipmentDate(arrivalDate, transitTime);
  let returnDate = AdvancedFulfillment.date.determineReturnDate(shipReturnBy, transitTime);


  // MOCKING OUR START TIME and END TIME
    let month = _.random(2, 11);
    let date = _.random(1, 25);
    if (!order.startTime) {
      order.startTime = new Date (2016, month, date);
    }
    if (!order.endTime) {
      order.endTime = new Date(2016, month, date + 3);
    }
  // delete in future



  ReactionCore.Collections.Orders.update({_id: orderId}, {
    $set: {
      'advancedFulfillment.workflow.status': 'orderCreated',
      'advancedFulfillment.workflow.workflow': [],
      'advancedFulfillment.transitTime': transitTime,
      'advancedFulfillment.localDelivery': localDelivery,
      'advancedFulfillment.items': afItems,
      'advancedFulfillment.arriveBy': arrivalDate,
      'advancedFulfillment.shipmentDate': shipmentDate,
      'advancedFulfillment.shipReturnBy': shipReturnBy,
      'advancedFulfillment.returnDate': returnDate,
      'startTime': order.startTime,
      'endTime': order.endTime
    }
  });
  return orderId;
});

