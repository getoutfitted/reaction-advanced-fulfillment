ReactionCore.MethodHooks.after('cart/copyCartToOrder', function (options) {
  console.log("===============ORDER");

  let orderId = options.result;
  console.log("ORDER", orderId);
  ReactionCore.Collections.Orders.update({_id: orderId}, {
    $set: {
      'advancedFulfillment.workflow.status': 'orderCreated',
      'advancedFulfillment.workflow.workflow': [],
      'advancedFulfillment.shipmentDate': moment().add(2, 'days')._d,
      'advancedFulfillment.returnDate': moment().add(7, 'days')._d
    }
    // $addToSet:{ 'advancedFulfillment.'

    // }
  });
  return orderId;
});

