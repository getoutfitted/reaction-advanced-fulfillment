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
AdvancedFulfillment.assignmentStatuses = ['orderPrinted', 'orderPicked', 'orderPacked', 'orderShippped'];
AdvancedFulfillment.nonAssignmentStatuses = ['orderCreated', 'orderPicking', 'orderPacking', 'orderReturned'];
