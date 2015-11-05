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
      returned: 'inspected',
      inspected: 'completed'
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
  'advancedFulfillment/itemMissing': function (orderId, itemId) {
    check(orderId, String);
    check(itemId, String);
    ReactionCore.Collections.Orders.update({
      _id: orderId,
      'advancedFulfillment.items._id': itemId
    }, {
      $set: {'advancedFulfillment.items.$.workflow.status': 'missing'}
    });
  },
  'advancedFulfillment/itemDamaged': function (orderId, itemId) {
    check(orderId, String);
    check(itemId, String);
    ReactionCore.Collections.Orders.update({
      _id: orderId,
      'advancedFulfillment.items._id': itemId
    }, {
      $set: {'advancedFulfillment.items.$.workflow.status': 'damaged'}
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
      $set: {'advancedFulfillment.items.$.workflow.status': 'inspected'}
    });
  },
  'advancedFulfillment/itemsAllCompleted': function (orderId) {
    check(orderId, String);
    let order = ReactionCore.Collections.Orders.findOne(orderId);
    let items = order.advancedFulfillment.items;
    _.each(items, function (item) {
      item.workflow.status = 'completed';
      item.workflow.workflow.push('inspected');
    });
    ReactionCore.Collections.Orders.update({
      _id: order._id
    }, {
      $set: { 'advancedFulfillment.items': items}
    });
  },
  'advancedFulfillment/itemsInspectedCompleted': function (orderId) {
    check(orderId, String);
    let order = ReactionCore.Collections.Orders.findOne(orderId);
    let items = order.advancedFulfillment.items;
    _.each(items, function (item) {
      if (item.workflow.status === 'inspected') {
        item.workflow.status = 'completed';
        item.workflow.workflow.push('inspected');
      }
    });
    ReactionCore.Collections.Orders.update({
      _id: order._id
    }, {
      $set: { 'advancedFulfillment.items': items}
    });

  }
});
