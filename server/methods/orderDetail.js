Meteor.methods({
  'advancedFulfillment/updateOrderWorkflow': function (orderId, userId, status) {
    check(orderId, String);
    check(userId, String);
    check(status, String);
    let workflow = {
      orderCreated: 'orderPicking',
      orderPicking: 'orderPacking',
      orderPacking: 'orderFulfilled'
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
  'advancedFulfillment/updateItemWorkflow': function (orderId, itemId, itemStatus) {
    check(orderId, String);
    check(itemId, String);
    check(itemStatus, String);
    let workflow = {
      'In Stock': 'picked',
      picked: 'packed',
      packed: 'completed'
    };
    ReactionCore.Collections.Orders.update({_id: orderId, 'advancedFulfillment.items._id': itemId}, {
      $set: { 'advancedFulfillment.items.$.workflow.status': workflow[itemStatus] },
      $addToSet: {'advancedFulfillment.items.$.workflow.workflow': itemStatus }
    });
  }
});
