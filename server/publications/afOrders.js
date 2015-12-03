Meteor.publish('afOrders', function () {
  shopId = ReactionCore.getShopId();

  if (Roles.userIsInRole(this.userId, ['admin', 'owner'], ReactionCore.getShopId())) {
    return ReactionCore.Collections.Orders.find({
      shopId: shopId
    }, {
      fields: {
        'advancedFulfillment.returnDate': 1,
        'advancedFulfillment.shipmentDate': 1,
        'advancedFulfillment.workflow.status': 1,
        'advancedFulfillment.items._id': 1,
        email: 1,
        shopifyOrderNumber: 1,
        'shipping.address.phone': 1,
        history: 1
      }

    });
  }
  return {}
;});
