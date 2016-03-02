AdvancedFulfillment.date = {};

function weekdayDaysAgo(date, days) {
  return // the weekday that was x days ago;
}

function prevWeekday(date) {
  // return previous weekday;
}

function nextWeekday(date) {
  // return next weekday;
}

function containsWeekendDays(start, end) {
  return
}

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

AdvancedFulfillment.date.ifWeekendSetPreviousBizDay = function (date) {
  check(date, Date);
  if (AdvancedFulfillment.date.isWeekend(date)) {
    date = AdvancedFulfillment.date.previousBusinessDay(date);
  }
  return moment(date);
};

// AdvancedFulfillment.date.addTransitTimeForWeekends = function (date, arrivalDate, transitTime) {
//   check(date, Date);
//   check(arrivalDate, Date);
//   check(transitTime, Number);
//   let transitDays = moment(date).add(1, 'day'); // Day box is dropped off doesn't count.
//   const range = transitDays.twix(arrivalDate, {allDay: true});
//   let iter = range.iterate('days');
//   let weekdayCounter = 0;
//   while (iter.hasNext()) {
//     let dayOfTheWeek = iter.next().isoWeekday();
//     console.log('day of the week:', dayOfTheWeek);
//     if (dayOfTheWeek < 6) {
//       weekdayCounter++;
//     }
//   }
//   console.log('shipping date', date)
//   console.log('weekdays', weekdayCounter)
//   console.log('transitTime', transitTime);
//   let additionalTransitRequired = 0;
//   if (weekdayCounter < transitTime) {
//     additionalTransitRequired = transitTime - weekdayCounter;
//   }
//   return moment(date).subtract()
//   // const shipmentRange = shipDate.twix(arrivalDate, {allDay: true});
//   // let iter = shipmentRange.iterate('days');
//   // //
//   // while (iter.hasNext()) {
//   //   let isoWeekday = iter.next().isoWeekday();
//   //   if (isoWeekday === 7 || isoWeekday === 6) {
//   //     numberOfWeekendDays += 1;
//   //   }
//   // }

//   // daysToAdd = numberOfWeekendDays - additionalDays;
// };

// AdvancedFulfillment.date.calculateBizDays = function (start, end) {
//   check(start, Date);
//   check(end, Date);
//   let bizDays = 0;
//   let days = 1;
//   // Add a day because shipping doesn't start until the next day;
//   let firstTransitDate = moment(start).add(1, 'days');
//   const range = firstTransitDate.twix(end, {allDay: true});
//   let iter = range.iterate('days');
//   while (iter.hasNext()) {
//     let dayOfTheWeek = iter.next().isoWeekday();
//     console.log('day', iter.next());
//     days++;
//     console.log('number of days', days)
//     if (dayOfTheWeek < 6) {
//       bizDays++;
//     }
//     console.log('num of biz days', bizDays)
//   }

//   return {days: days, bizDays: bizDays};
// };

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

AdvancedFulfillment.shipmentChecker = function (date, localDelivery, transitTime) {
  if (localDelivery) {
    return date;
  }

  let numberOfWeekendDays = 0;
  let shipDate = moment(date);
  let arrivalDate = moment(shipDate).add(transitTime, 'days');
  let additionalDays = 0;
  let daysToAdd = 0;

  if (moment(arrivalDate).isoWeekday() === 7) {
    shipDate.subtract(2, 'days');
    additionalDays += 2;
    arrivalDate.subtract(2, 'days');
  } else if (moment(arrivalDate).isoWeekday() === 6) {
    shipDate.subtract(1, 'days');
    additionalDays += 1;
    arrivalDate.subtract(1, 'days');
  }

  if (moment(shipDate).isoWeekday() === 7) {
    shipDate.subtract(2, 'days');
    additionalDays += 2;
  } else if (moment(shipDate).isoWeekday() === 6) {
    shipDate.subtract(1, 'days');
    additionalDays += 1;
  }

  const shipmentRange = shipDate.twix(arrivalDate, {allDay: true});
  let iter = shipmentRange.iterate('days');
  //
  while (iter.hasNext()) {
    let isoWeekday = iter.next().isoWeekday();
    if (isoWeekday === 7 || isoWeekday === 6) {
      numberOfWeekendDays += 1;
    }
  }

  daysToAdd = numberOfWeekendDays - additionalDays;
  if (daysToAdd <= 0) {
    daysToAdd = 0;
  }
  console.log('daysToAdd', daysToAdd)
  console.log('final shipDate', shipDate.subtract(daysToAdd, 'days').toDate())
  return shipDate.subtract(daysToAdd, 'days').toDate();
};

AdvancedFulfillment.returnChecker = function (date, localDelivery) {
  if (localDelivery) {
    return date;
  }
  if (moment(date).isoWeekday() === 7) {
    return moment(date).add(1, 'days').toDate();
  }
  return date;
};

