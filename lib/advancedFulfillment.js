AdvancedFulfillment = {};

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
  'orderReadyToShip',
  'orderShipped'
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
