Meteor.methods({
  'advancedFulfillment/updateItemWorkflow': function (orderId, itemId, itemStatus) {
    check(orderId, String);
    check(itemId, String);
    check(itemStatus, String);
    let workflow = {
      'In Stock': 'picked',
      picked: 'packed',
      packed: 'shipped',
      shipped: 'returned',
      returned: 'completed'
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
  },
  'advancedFulfillment/itemMissing': function (orderId, itemId, userId) {
    check(orderId, String);
    check(itemId, String);
    check(userId, String);
    let historyEvent = {
      event: 'missingItem',
      userId: userId,
      updatedAt: new Date()
    };
    ReactionCore.Collections.Orders.update({
      _id: orderId,
      'advancedFulfillment.items._id': itemId
    }, {
      $set: {'advancedFulfillment.items.$.workflow.status': 'missing'},
      $addToSet: {
        history: historyEvent,
        'advancedFulfillment.items.$.workflow.workflow': 'missing'
      }
    });
  },
  'advancedFulfillment/itemDamaged': function (orderId, itemId, userId) {
    check(orderId, String);
    check(itemId, String);
    check(userId, String)
    let historyEvent = {
      event: 'damagedItem',
      userId: userId,
      updatedAt: new Date()
    };
    ReactionCore.Collections.Orders.update({
      _id: orderId,
      'advancedFulfillment.items._id': itemId
    }, {
      $set: {'advancedFulfillment.items.$.workflow.status': 'damaged'},
      $addToSet: {
        history: historyEvent,
        'advancedFulfillment.items.$.workflow.workflow': 'damaged'
      }
    });
  },
  'advancedFulfillment/itemReturned': function (orderId, itemId) {
    check(orderId, String);
    check(itemId, String);
    ReactionCore.Collections.Orders.update({
      _id: orderId,
      'advancedFulfillment.items._id': itemId
    }, {
      $set: {'advancedFulfillment.items.$.workflow.status': 'returned'}
    });
  },
  'advancedFulfillment/itemRepaired': function (orderId, itemId) {
    check(orderId, String);
    check(itemId, String);
    ReactionCore.Collections.Orders.update({
      _id: orderId,
      'advancedFulfillment.items._id': itemId
    }, {
      $set: {'advancedFulfillment.items.$.workflow.status': 'completed'}
    });
  }
});
