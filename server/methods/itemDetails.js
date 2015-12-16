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
  'advancedFulfillment/updateAllItems': function (order, currentItemStatus) {
    check(order, Object);
    check(currentItemStatus, String);
    let items = order.advancedFulfillment.items;
    let allItems = _.every(items, function (item) {
      return item.workflow.status === currentItemStatus;
    });
    if (!allItems) {
      throw new Meteor.Error('Invalid Item Status');
    }
    let indexOfNextStatus = AdvancedFulfillment.itemStatus.indexOf(currentItemStatus) + 1;
    _.each(items, function (item) {
      item.workflow.status = AdvancedFulfillment.itemStatus[indexOfNextStatus];
      item.workflow.workflow.push(currentItemStatus);
    });
    ReactionCore.Collections.Orders.update({
      _id: order._id
    }, {
      $set: {
        'advancedFulfillment.items': items
      }
    });
  },
  'advancedFulfillment/itemIssue': function (orderId, itemId, userId, issue) {
    check(orderId, String);
    check(itemId, String);
    check(userId, String);
    check(issue, String);
    let historyEvent = {
      event: issue + 'Item',
      userId: userId,
      updatedAt: new Date()
    };
    ReactionCore.Collections.Orders.update({
      '_id': orderId,
      'advancedFulfillment.items._id': itemId
    }, {
      $set: {'advancedFulfillment.items.$.workflow.status': issue},
      $addToSet: {
        'history': historyEvent,
        'advancedFulfillment.items.$.workflow.workflow': issue
      }
    });
  },
  'advancedFulfillment/itemResolved': function (orderId, itemId, issue) {
    check(orderId, String);
    check(itemId, String);
    check(issue, String);
    ReactionCore.Collections.Orders.update({
      '_id': orderId,
      'advancedFulfillment.items._id': itemId
    }, {
      $set: {
        'advancedFulfillment.items.$.workflow.status': 'returned'
      },
      $addToSet: {
        'advancedFulfillment.items.$.workflow.status': issue
      }
    });
    return ReactionCore.Collections.Orders.findOne(orderId);
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
    let orderItems = order.items;
    let oldItem = _.findWhere(orderItems, {_id: oldItemId});
    let orderAfItems = order.advancedFulfillment.items;
    let oldAfItem = _.findWhere(orderAfItems, {_id: oldItemId});
    let id = Random.id();
    let shopId = ReactionCore.getShopId();
    let newItem = {
      _id: id,
      shopId: shopId,
      productId: product._id,
      quantity: 1,
      variants: variant,
      workflow: oldItem.workflow
    };
    let newAfItem = {
      _id: id,
      productId: product._id,
      shopId: shopId,
      quantity: 1,
      variantId: variant._id,
      price: variant.price,
      sku: variant.sku,
      location: variant.location,
      itemDescription: product.gender + ' - ' + product.vendor + ' - ' + product.title,
      workflow: oldAfItem.workflow
    };
    let updatedItems = _.map(orderItems, function (item) {
      if (item._id === oldItemId) {
        return newItem;
      }
      return item;
    });
    let updatedAfItems = _.map(orderAfItems, function (item) {
      if (item._id === oldItemId) {
        return newAfItem;
      }
      return item;
    });
    let allItemsUpdated = _.every(updatedAfItems, function (item) {
      return item.variantId;
    });
    let orderNotes = order.notes + '\nItem # ' + oldAfItem._id + ' - ' + oldAfItem.itemDescription + ' - ' + oldItem.variants.size + ' - ' + oldItem.variants.color + ' was replaced with: \n' + newAfItem.itemDescription + ' - ' + newItem.variants.size + ' - ' + newItem.variants.color;
    ReactionCore.Collections.Orders.update({
      _id: order._id
    }, {
      $set: {
        'items': updatedItems,
        'advancedFulfillment.items': updatedAfItems,
        'orderNotes': orderNotes,
        'itemMissingDetails': !allItemsUpdated
      }
    });
  },
  'advancedFulfillment/addItem': function (order, type, gender, title, color, variantId) {
    check(order, Object);
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
    let id = Random.id();
    let shopId = ReactionCore.getShopId();
    let newItem = {
      _id: id,
      shopId: shopId,
      productId: product._id,
      quantity: 1,
      variants: variant
    };
    let newAfItem = {
      _id: id,
      productId: product._id,
      shopId: shopId,
      quantity: 1,
      variantId: variant._id,
      price: variant.price,
      sku: variant.sku,
      location: variant.location,
      itemDescription: product.gender + ' - ' + product.vendor + ' - ' + product.title
    };
    let orderNotes = order.notes + '\n New Item was added to Order:' + newAfItem.itemDescription + ' - ' + newItem.variants.size + ' - ' + newItem.variants.color;
    ReactionCore.Collections.Orders.update({
      _id: order._id
    }, {
      $set: {
        orderNotes: orderNotes
      },
      $addToSet: {
        'items': newItem,
        'advancedFulfillment.items': newAfItem
      }
    });
  }
});
