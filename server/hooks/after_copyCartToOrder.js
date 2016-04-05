ReactionCore.MethodHooks.after('cart/copyCartToOrder', function (options) {
  const orderId = options.result || arguments[0];
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
  advancedFulfillment.items = AdvancedFulfillment.itemsToAFItems(order.items);
  let orderHasNoRentals = _.every(order.items, function (item) {
    return item.variants.functionalType === 'variant';
  });
  const shippingAddress = AdvancedFulfillment.addressFormatForFedExApi(order.shipping[0].address);
  // check if local delivery
  advancedFulfillment.localDelivery = AdvancedFulfillment.determineLocalDelivery(order.shipping[0].address.postal);
  if (orderHasNoRentals) {
    let today = new Date();
    advancedFulfillment.shipmentDate = AdvancedFulfillment.date.nextBusinessDay(today);
  } else {
    // if local set tranist time to 0 else call FedEx Api for tranist time
    advancedFulfillment.transitTime = advancedFulfillment.localDelivery ? 0 : AdvancedFulfillment.FedExApi.getFedexTransitTime(shippingAddress);
    if (advancedFulfillment.transitTime === false) {
      advancedFulfillment.transitTime = afPackage.settings.buffer.shipping || 4; // If no fedEx setting to general date
    }
    // set all the transit times - as we should have order.startTime and order.endtime
    af.startTime = order.startTime;
    af.endTime = order.endTime;
    advancedFulfillment.arriveBy = AdvancedFulfillment.date.determineArrivalDate(order.startTime);
    advancedFulfillment.shipReturnBy = AdvancedFulfillment.date.determineShipReturnByDate(order.endTime);
    advancedFulfillment.shipmentDate = AdvancedFulfillment.date.determineShipmentDate(advancedFulfillment.arriveBy, advancedFulfillment.transitTime);
    advancedFulfillment.returnDate = AdvancedFulfillment.date.determineReturnDate(advancedFulfillment.shipReturnBy, advancedFulfillment.transitTime);
  }

  af.orderNumber =  AdvancedFulfillment.findAndUpdateNextOrderNumber();

  try {
    ReactionCore.Collections.Orders.update({
      _id: orderId
    }, {
      $set: af
    });
  } catch (error) {
    af.orderNumber =  AdvancedFulfillment.findHighestOrderNumber();
    ReactionCore.Collections.Orders.update({
      _id: orderId
    }, {
      $set: af
    });
  }
  return orderId;
});

