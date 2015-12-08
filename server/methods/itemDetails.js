Meteor.methods({
  'advancedFulfillment/updateItemWorkflow': function (orderId, itemId, itemStatus) {
    check(orderId, String);
    check(itemId, String);
    check(itemStatus, String);
    let workflow = {
      'In Stock': 'picked',
      'picked': 'packed',
      'packed': 'shipped',
      'shipped': 'returned',
      'returned': 'completed'
    };
    ReactionCore.Collections.Orders.update({
      '_id': orderId,
      'advancedFulfillment.items._id': itemId
    }, {
      $set: { 'advancedFulfillment.items.$.workflow.status': workflow[itemStatus] },
      $addToSet: {'advancedFulfillment.items.$.workflow.workflow': itemStatus }
    });
  },
  'advancedFulfillment/updateAllItemsToShipped': function (order) { // TODO: Combine these update this method and all Packed
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
  'advancedFulfillment/allItemsToPacked': function (order) {
    check(order, Object);
    if (order.advancedFulfillment.workflow.status !== 'orderPacking') {
      throw new Meteor.Error('Invalid Order Status');
    }
    let items = order.advancedFulfillment.items;
    let allPicked = _.every(items, function (item) {
      return item.workflow.status === 'picked';
    });
    if (!allPicked) {
      throw new Meteor.Error('Invalid Item Status');
    }
    _.each(items, function (item) {
      item.workflow.status = 'packed';
      item.workflow.workflow.push('picked');
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
      '_id': orderId,
      'advancedFulfillment.items._id': itemId
    }, {
      $set: {'advancedFulfillment.items.$.workflow.status': 'missing'},
      $addToSet: {
        'history': historyEvent,
        'advancedFulfillment.items.$.workflow.workflow': 'missing'
      }
    });
  },
  'advancedFulfillment/itemDamaged': function (orderId, itemId, userId) {
    check(orderId, String);
    check(itemId, String);
    check(userId, String);
    let historyEvent = {
      event: 'damagedItem',
      userId: userId,
      updatedAt: new Date()
    };
    ReactionCore.Collections.Orders.update({
      '_id': orderId,
      'advancedFulfillment.items._id': itemId
    }, {
      $set: {'advancedFulfillment.items.$.workflow.status': 'damaged'},
      $addToSet: {
        'history': historyEvent,
        'advancedFulfillment.items.$.workflow.workflow': 'damaged'
      }
    });
  },
  'advancedFulfillment/itemReturned': function (orderId, itemId) {
    check(orderId, String);
    check(itemId, String);
    ReactionCore.Collections.Orders.update({
      '_id': orderId,
      'advancedFulfillment.items._id': itemId
    }, {
      $set: {'advancedFulfillment.items.$.workflow.status': 'returned'}
    });
  },
  'advancedFulfillment/itemRepaired': function (orderId, itemId) {
    check(orderId, String);
    check(itemId, String);
    ReactionCore.Collections.Orders.update({
      '_id': orderId,
      'advancedFulfillment.items._id': itemId
    }, {
      $set: {'advancedFulfillment.items.$.workflow.status': 'completed'}
    });
  },
  'advancedFulfillment/updateItemsColorAndSize': function (order, itemId, productId, variantId) {
    check(order, Object);
    check(itemId, String);
    check(productId, String);
    check(variantId, String);
    let product = Products.findOne(productId);
    let variants = product.variants;
    let variant = _.findWhere(variants, {_id: variantId});
    let orderItems = order.items;
    let orderNotes = order.orderNotes;

    orderNotes = orderNotes + ' \n Item #' + itemId + ' with SKU#' + variant.sku +
     ' was updated with to have: color:' + variant.color + ' and size: ' + variant.size;
    _.each(orderItems, function (item) {
      if (item._id === itemId) {
        item.variants = variant;
      }
    });
    let afItems = order.advancedFulfillment.items;
    _.each(afItems, function (item) {
      if (item._id === itemId) {
        item.variantId = variant._id;
        item.location = variant.location;
        item.sku = variant.sku;
      }
    });

    let allItemsUpdated = _.every(afItems, function (item) {
      return item.variantId;
    });
    ReactionCore.Collections.Orders.update({_id: order._id}, {
      $set: {
        'items': orderItems,
        'advancedFulfillment.items': afItems,
        'orderNotes': orderNotes,
        'itemMissingDetails': !allItemsUpdated
      }
    });
  },
  'advancedFulfillment/itemExchange': function (order, oldItemId, type, gender, title, color, variantId) {
    check(order, Object);
    check(oldItemId, String);
    check(type, String);
    check(gender, String);
    check(title, String);
    check(color, String);
    check(variantId, String);
    let product = Products.findOne({
      productType: type,
      gender: gender,
      title: title
    });
    let variant = _.findWhere(product.variants, {_id: variantId});
    console.log('productID', product._id);
    console.log('variant', variant);
    let id = Random.id();
    let shopId = ReactionCore.getShopId();
    let newItem = {
      _id: id,
      shopId: shopId,
      productId: product._id,
      quantity: 1,
      variants: variant
    };
    let afItem = {

    };
  }
});
