AdvancedFulfillment = {};

AdvancedFulfillment.humanActionStatuses = {
  'orderCreated': 'Print Order',
  'orderPrinted': 'Pick Order',
  'orderPicking': 'Pick Order',
  'orderPicked': 'Pack Order',
  'orderPacking': 'Pack Order',
  'orderPacked': 'Label Order',
  'orderReadyToShip': 'Ship Order',
  'orderShipped': 'Return Order',
  'orderReturned': 'Archive Order',
  'orderComplete': 'View Order',
  'orderIncomplete': 'View Order'
};

AdvancedFulfillment.humanOrderStatuses = {
  'orderCreated': 'Created',
  'orderPrinted': 'Printed',
  'orderPicking': 'Picking',
  'orderPicked': 'Picked',
  'orderPacking': 'Packing',
  'orderPacked': 'Packed',
  'orderReadyToShip': 'Labeled',
  'orderShipped': 'Shipped',
  'orderReturned': 'Returned',
  'orderComplete': 'Complete',
  'orderIncomplete': 'Incomplete',
  'nonWarehouseOrder': 'nonWarehouseOrder'
};

AdvancedFulfillment.workflow = [
  'orderCreated',
  'orderPrinted',
  'orderPicking',
  'orderPicked',
  'orderPacking',
  'orderPacked',
  'orderReadyToShip',
  'orderShipped',
  'orderReturned'
];

AdvancedFulfillment.orderActive = [
  'orderCreated',
  'orderPrinted',
  'orderPicking',
  'orderPicked',
  'orderPacking',
  'orderPacked',
  'orderReadyToShip'
];

AdvancedFulfillment.orderReturning = [
  'orderShipped',
  'orderReturned'
];

AdvancedFulfillment.orderArchivedStatus = [
  'orderComplete',
  'orderIncomplete'
];

AdvancedFulfillment.assignmentStatuses = ['orderPrinted', 'orderPicked',  'orderShipped'];
AdvancedFulfillment.nonAssignmentStatuses = ['orderCreated', 'orderPicking', 'orderPacking', 'orderPacked', 'orderReturned'];
AdvancedFulfillment.itemStatus = ['In Stock', 'picked', 'packed', 'shipped'];

AdvancedFulfillment.localDeliveryZipcodes = [
  '80424',
  '80435',
  '80443',
  '80497',
  '80498',
  '81657',
  '81620',
  '81657'
];

AdvancedFulfillment.calendarReferenceTime = {
  sameDay: '[Today]',
  nextDay: '[Tomorrow]',
  nextWeek: '[This] dddd',
  lastDay: '[Yesterday]',
  lastWeek: '[Last] dddd',
  sameElse: 'll'
};

AdvancedFulfillment.shippingCalendarReference = {
  sameDay: '[Today]',
  nextDay: '[Tomorrow]',
  nextWeek: 'dddd',
  lastDay: '[Yesterday]',
  lastWeek: '[Last] dddd',
  sameElse: 'ddd MMM D, YYYY'
};

AdvancedFulfillment.dateFormatter = function (date) {
  return moment(date).format('MMMM Do, YYYY');
};
