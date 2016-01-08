Meteor.publish('afOrders', function () {
  shopId = ReactionCore.getShopId();

  if (Roles.userIsInRole(this.userId, ['admin', 'owner'], ReactionCore.getShopId())) {
    return ReactionCore.Collections.Orders.find({
      shopId: shopId
    }, {
      fields: {
        'startTime': 1,
        'advancedFulfillment.returnDate': 1,
        'advancedFulfillment.shipmentDate': 1,
        'advancedFulfillment.workflow.status': 1,
        'advancedFulfillment.items._id': 1,
        'advancedFulfillment.items.workflow': 1,
        'advancedFulfillment.arriveBy': 1,
        // 'email': 1,
        'shopifyOrderNumber': 1,
        // 'shipping.address.phone': 1,
        'history': 1,
        'shipping.address.region': 1,
        'shipping.address.city': 1,
        'shipping.address.fullName': 1,
        // 'billing.address.fullName': 1,
        'advancedFulfillment.localDelivery': 1,
        'advancedFulfillment.rushDelivery': 1,
        'advancedFulfillment.kayakRental.vendor': 1,
        'advancedFulfillment.kayakRental.qty': 1,
        'advancedFulfillment.rushShippingPaid': 1
      }
    });
  }
  return this.ready();
});

Meteor.publish('afProducts', function () {
  return ReactionCore.Collections.Products.find({});
});

Meteor.publish('advancedFulfillmentOrder', function (orderId) {
  check(orderId, String);
  shopId = ReactionCore.getShopId();
  if (Roles.userIsInRole(this.userId, ['admin', 'owner', 'dashboard/advanced-fulfillment', 'reaction-advanced-fulfillment'], ReactionCore.getShopId())) {
    return ReactionCore.Collections.Orders.find({
      _id: orderId,
      shopId: shopId
    });
  }
  return this.ready();
});

Meteor.publish('searchOrders', function () {
  shopId = ReactionCore.getShopId();
  if (Roles.userIsInRole(this.userId, ['admin', 'owner', 'dashboard/advanced-fulfillment', 'reaction-advanced-fulfillment'], ReactionCore.getShopId())) {
    return ReactionCore.Collections.Orders.find({
      'shopId': shopId,
      'advancedFulfillment.workflow.status': {
        $in: AdvancedFulfillment.orderActive
      }
    }, {
      fields: {
        _id: 1,
        shopifyOrderNumber: 1
      }
    });
  }
  return this.ready();
});

Meteor.publish('shippingOrders', function () {
  shopId = ReactionCore.getShopId();
  if (Roles.userIsInRole(this.userId, ['admin', 'owner', 'dashboard/advanced-fulfillment', 'reaction-advanced-fulfillment'], ReactionCore.getShopId())) {
    return ReactionCore.Collections.Orders.find({
      'shopId': shopId,
      'items': {$ne: []},
      'advancedFulfillment.workflow.status': {
        $in: AdvancedFulfillment.orderShipping
      },
      'startTime': {$ne: undefined}
    }, {
      fields: AdvancedFulfillment.fields.ordersList
    });
  }
});

Meteor.publish('ordersByStatus', function (status) {
  check(status, String);
  shopId = ReactionCore.getShopId();
  if (Roles.userIsInRole(this.userId, ['admin', 'owner', 'dashboard/advanced-fulfillment', 'reaction-advanced-fulfillment'], ReactionCore.getShopId())) {
    return ReactionCore.Collections.Orders.find({
      'shopId': shopId,
      'advancedFulfillment.workflow.status': status
    }, {
      fields: AdvancedFulfillment.fields.ordersList
    });
  }
});

Meteor.publish('selectedOrders', function (orderIds) {
  check(orderIds, [String]);
  shopId = ReactionCore.getShopId();
  if (Roles.userIsInRole(this.userId, ['admin', 'owner', 'dashboard/advanced-fulfillment', 'reaction-advanced-fulfillment'], ReactionCore.getShopId())) {
    return ReactionCore.Collections.Orders.find({
      _id: {
        $in: orderIds
      }
    }, {
      fields: {
        'items': 0,
        'advancedFulfillment.paymentInformation.refunds': 0,
        'advancedFulfillment.paymentInformation.transactions': 0
      }
    });
  }
});

Meteor.publish('nonWarehouseOrders', function () {
  shopId = ReactionCore.getShopId();
  if (Roles.userIsInRole(this.userId, ['admin', 'owner', 'dashboard/advanced-fulfillment', 'reaction-advanced-fulfillment'], ReactionCore.getShopId())) {
    return ReactionCore.Collections.Orders.find({
      'shopId': shopId,
      'advancedFulfillment.workflow.status': 'nonWarehouseOrder'
    });
  }
  return this.ready();
});
