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
