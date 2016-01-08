Meteor.methods({
  'advancedFulfillment/shipSelectedOrders': function (orderIds) {
    check(orderIds, [String]);
    // if (!ReactionCore.hasPermission('reaction-advanced-fulfillment')) {
    //   throw new Meteor.Error(403, 'Access Denied');
    // }
    this.unblock();
    _.each(orderIds, function (orderId) {
      let order = ReactionCore.Collections.Orders.findOne(orderId);
      let currentStatus = order.advancedFulfillment.workflow.status;
      if (currentStatus === 'orderReadyToShip') {
        Meteor.call('advancedFulfillment/updateOrderWorkflow', order._id, Meteor.userId(), currentStatus);
      }
    });
  },
  'advancedFulfillment/printSelectedOrders': function (orderIds) {
    check(orderIds, [String]);
    // if (!ReactionCore.hasPermission('reaction-advanced-fulfillment')) {
    //   throw new Meteor.Error(403, 'Access Denied');
    // }
    this.unblock();
    _.each(orderIds, function (orderId) {
      let order = ReactionCore.Collections.Orders.findOne(orderId);
      let currentStatus = order.advancedFulfillment.workflow.status;
      if (currentStatus === 'orderCreated') {
        Meteor.call('advancedFulfillment/updateOrderWorkflow', order._id, Meteor.userId(), currentStatus);
      }
    });
  }
});
