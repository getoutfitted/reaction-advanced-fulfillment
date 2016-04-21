AdvancedFulfillment.calculateTransitTime = function (order) {
  const afPackage = ReactionCore.Collections.Packages.findOne({
    name: 'reaction-advanced-fulfillment',
    shopId: ReactionCore.getShopId()
  });
  const shippingAddress = order.shipping[0].address;
  const localDelivery = AdvancedFulfillment.determineLocalDelivery(shippingAddress.postal);
  const defaultTransitTime = afPackage.settings.buffer.shipping || 4;
  if (localDelivery) {
    return 0;
  }
  const formattedShippingAddress = AdvancedFulfillment.addressFormatForFedExApi(shippingAddress);
  const carrierTransitTime = AdvancedFulfillment.determineShippingCarrier(
    afPackage.settings.selectedShipping, formattedShippingAddress);

  return carrierTransitTime || defaultTransitTime;
};

AdvancedFulfillment.calculateShippingDay = function (order) {
  let start = moment(order.startTime);
  let bonusTransitDays = 0;
  if (start.isoWeekday() === 6) {
    bonusTransitDays = bonusTransitDays + 1;
  } else if (start.isoWeekday() === 7) {
    bonusTransitDays = bonusTransitDays + 2;
  }

  let timeInTransit = AdvancedFulfillment.calculateTransitTime(order);
  let shippingDay = moment(start).subtract(timeInTransit + bonusTransitDays, 'days');
  if (shippingDay.isoWeekday() >= 6 || shippingDay.isoWeekday() + timeInTransit >= 6) {
    return shippingDay.subtract(2, 'days');
  }
  return shippingDay;
};

// Calculates the day an order should return to the warehouse
AdvancedFulfillment.calculateReturnDay = function (order) {
  let end = moment(order.endTime);
  let bonusTransitDays = 0;
  if (end.isoWeekday() === 6) {
    bonusTransitDays = bonusTransitDays + 2;
  } else if (end.isoWeekday() === 7) {
    bonusTransitDays = bonusTransitDays + 1;
  }

  let timeInTransit = AdvancedFulfillment.calculateTransitTime(order);
  let returnDay = moment(end).add(timeInTransit + bonusTransitDays, 'days');
  if (returnDay.isoWeekday() >= 6 || returnDay.isoWeekday() + timeInTransit >= 6) {
    return returnDay.add(2, 'days');
  }
  return returnDay;
};
