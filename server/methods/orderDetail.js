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
  'advancedFulfillment/updateItemWorkflow': function (orderId, itemId, itemStatus) {
    check(orderId, String);
    check(itemId, String);
    check(itemStatus, String);
    let workflow = {
      'In Stock': 'picked',
      picked: 'packed',
      packed: 'shipped',
      shipped: 'returned'
    };
    ReactionCore.Collections.Orders.update({
      _id: orderId,
      'advancedFulfillment.items._id': itemId
    }, {
      $set: { 'advancedFulfillment.items.$.workflow.status': workflow[itemStatus] },
      $addToSet: {'advancedFulfillment.items.$.workflow.workflow': itemStatus }
    });
  },
  'advancedFulfillment/updateAllItemsToShipped': function (order) {
    check(order, Object);
    if (order.advancedFulfillment.workflow.status !== 'orderFulfilled') {
      throw new Meteor.Error('Invalid Order Status');
    }
    let items = order.advancedFulfillment.items;
    let allPacked = _.every(items, function (item) {
      return item.workflow.status === 'packed';
    });
    if (!allPacked) {
      throw new Meteor.Error('Invalid Item Status');
    }
    _.each(items, function (item) {
      item.workflow.status = 'shipped';
      item.workflow.workflow.push('packed');
    });
    ReactionCore.Collections.Orders.update({
      _id: order._id
    }, {
      $set: { 'advancedFulfillment.items': items}
    });
  }
});
