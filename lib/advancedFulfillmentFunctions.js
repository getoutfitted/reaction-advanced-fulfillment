AdvancedFulfillment.date = {};

AdvancedFulfillment.addressFormatForFedExApi = function (address) {
  let shippingAddress = {};
  shippingAddress.address1 = address.address1;
  if (address.address2) {
    shippingAddress.address2 = address.address2;
  }
  shippingAddress.city = address.city;
  shippingAddress.region = address.region;
  shippingAddress.postal = address.postal;
  shippingAddress.country = address.country;
  return shippingAddress;
};

AdvancedFulfillment.date.isWeekend = function (date) {
  check(date, Date);
  return moment(date).isoWeekday() === 7 || moment(date).isoWeekday() === 6;
};

AdvancedFulfillment.date.isSunday = function (date) {
  check(date, Date);
  return moment(date).isoWeekday() === 7;
};

AdvancedFulfillment.date.isSaturday = function (date) {
  check(date, Date);
  return moment(date).isoWeekday() === 6;
};

AdvancedFulfillment.date.previousBusinessDay = function (date) {
  check(date, Date);
  if (this.isSunday(date)) {
    return moment(date).subtract(2, 'days');
  } else if (this.isSaturday(date)) {
    return moment(date).subtract(1, 'days');
  }
  return date;
};

AdvancedFulfillment.date.nextBusinessDay = function (date) {
  check(date, Date);
  if (this.isSunday(date)) {
    return moment(date).add(1, 'days');
  } else if (this.isSaturday(date)) {
    return moment(date).add(2, 'days');
  }
  return date;
};

AdvancedFulfillment.date.ifWeekendSetPreviousBizDay = function (date) {
  check(date, Date);
  if (AdvancedFulfillment.date.isWeekend(date)) {
    date = AdvancedFulfillment.date.previousBusinessDay(date);
  }
  return moment(date);
};

AdvancedFulfillment.date.ifWeekendSetNextBizDay = function (date) {
  check(date, Date);
  if (AdvancedFulfillment.date.isWeekend(date)) {
    date = AdvancedFulfillment.date.nextBusinessDay(date);
  }
  return moment(date);
};

AdvancedFulfillment.date.enoughBizDaysForTransit = function (startDate, endDate, transitTime) {
  check(startDate, Date);
  check(endDate, Date);
  check(transitTime, Number);
  let bizDays = 0;
  let range = moment(startDate).twix(endDate, {allDay: true});
  let iter = range.iterate('days');
  while (iter.hasNext()) {
    let dayOfTheWeek = iter.next().isoWeekday();
    if (dayOfTheWeek < 6) {
      bizDays++;
    }
  }
  return bizDays >= transitTime;
};

AdvancedFulfillment.date.determineShipReturnByDate = function (endTime) {
  check(endTime, Date);
  let shipReturnBy = moment(endTime).add(1, 'day');
  shipReturnBy = AdvancedFulfillment.date.ifWeekendSetNextBizDay(shipReturnBy.toDate());
  return shipReturnBy.toDate();
};

AdvancedFulfillment.date.determineArrivalDate = function (startTime) {
  check(startTime, Date);
  let arrivalDate = moment(startTime).subtract(1, 'day');
  arrivalDate = AdvancedFulfillment.date.ifWeekendSetPreviousBizDay(arrivalDate.toDate());
  return arrivalDate.toDate();
};

AdvancedFulfillment.date.determineShipmentDate = function (arrivalDate, transitTime) {
  check(arrivalDate, Date);
  check(transitTime, Number);
  let shipmentDate = moment(arrivalDate).subtract(transitTime, 'days');
  let enoughTransitTime = false;
  while (enoughTransitTime === false) {
    enoughTransitTime = AdvancedFulfillment.date.enoughBizDaysForTransit(shipmentDate.toDate(), arrivalDate, transitTime);
    shipmentDate = moment(shipmentDate).subtract(1, 'day');
  }
  shipmentDate = AdvancedFulfillment.date.ifWeekendSetPreviousBizDay(shipmentDate.toDate());
  return shipmentDate.toDate();
};

AdvancedFulfillment.determineLocalDelivery = function (shippingZipeCode) {
  check(shippingZipeCode, String);
  return _.contains(this.localDeliveryZipcodes, shippingZipeCode);
};

AdvancedFulfillment.itemsToAFItems = function (items) {
  check(items, [Object]);
  return _.map(items, function (item) {
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
};