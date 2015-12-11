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
AdvancedFulfillment.assignmentStatuses = ['orderPrinted', 'orderPicked',  'orderShippped'];
AdvancedFulfillment.nonAssignmentStatuses = ['orderCreated', 'orderPicking', 'orderPacking', 'orderPacked', 'orderReturned'];
AdvancedFulfillment.itemStatus = ['In Stock', 'picked', 'packed', 'shipped'];
AdvancedFulfillment.localDeliveryZipcodes = [ '80435', '80424', '80443', '81657', '80498', '80468', '80452', '80482', '80442', '80478', '81658'];
