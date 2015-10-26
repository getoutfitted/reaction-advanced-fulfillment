ReactionCore.MethodHooks.after('cart/copyCartToOrder', function (options) {
  let orderId = options.result || arguments[0];
  let itemList = ReactionCore.Collections.Orders.findOne(orderId).items;
  let items = _.map(itemList, function (item) {
    return {
      _id: item._id,
      productId: item.productId,
      shopId: item.shopId,
      quantity: item.quantity,
      variantId: item.variants._id,
      itemDescription: item.variants.title,
      workflow: {
        status: 'In Stock',
        workflow: []
      }
    };
  });
  ReactionCore.Collections.Orders.update({_id: orderId}, {
    $set: {
      'advancedFulfillment.workflow.status': 'orderCreated',
      'advancedFulfillment.workflow.workflow': [],
      'advancedFulfillment.shipmentDate': moment().add(2, 'days')._d,
      'advancedFulfillment.returnDate': moment().add(7, 'days')._d
    },
    $addToSet: {
      'advancedFulfillment.items': {
        $each: items
      }
    }

    // }
  });
  return orderId;
});

