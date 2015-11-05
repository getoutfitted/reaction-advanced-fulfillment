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
  'advancedFulfillment/finalOrderStatus': function (status, orderId, userId) {
    check(status, String);
    check(orderId, String);
    check(userId, String);
    let historyEvent = {
      event: status,
      userId: userId,
      updatedAt: new Date()
    };
    ReactionCore.Collections.Orders.update({_id: orderId}, {
      $addToSet: {
        'history': historyEvent,
        'advancedFulfillment.workflow.workflow': status
      },
      $set: {
        'advancedFulfillment.workflow.status': status
      }
    });
    if (status === 'orderCompleted') {
      Meteor.call('advancedFulfillment/itemsAllCompleted', orderId);
    } else if (status === 'orderIncomplete') {
      Meteor.call('advancedFulfillment/itemsInspectedCompleted', orderId);
    }
  }
});
