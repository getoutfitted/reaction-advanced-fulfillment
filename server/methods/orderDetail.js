Meteor.methods({
  'advancedFulfillment/updateOrderWorkflow': function (orderId, userId, status) {
    check(orderId, String);
    check(userId, String);
    check(status, String);
    let workflow = {
      orderCreated: 'orderPicking',
      orderPicking: 'orderPacking',
      orderPacking: 'orderFulfilled',
      orderFulfilled: 'orderShipping',
      orderShipping: 'orderReturning',
      orderReturning: 'orderInspecting'
    };
    let date = new Date();
    let historyEvent = {
      event: workflow[status],
      userId: userId,
      updatedAt: date
    };
    ReactionCore.Collections.Orders.update({_id: orderId}, {
      $addToSet: {
        'history': historyEvent,
        'advancedFulfillment.workflow.workflow': status
      },
      $set: {
        'advancedFulfillment.workflow.status': workflow[status]
      }
    });
  },
  'advancedFulfillment/orderCompleted': function (order, userId) {
    check(order, Object);
    check(userId, String);
    let items = order.advancedFulfillment.items;
    _.each(items, function (item) {
      item.workflow.status = 'completed';
      item.workflow.workflow.push('inspected');
    });
    let date = new Date();
    let historyEvent = {
      event: 'orderCompleted',
      userId: userId,
      updatedAt: date
    };
    ReactionCore.Collections.Orders.update({_id: order._id}, {
      $addToSet: {
        'history': historyEvent,
        'advancedFulfillment.workflow.workflow': 'orderInspected'
      },
      $set: {
        'advancedFulfillment.workflow.status': 'orderCompleted',
        'advancedFulfillment.items': items
      }
    });
  }
});
