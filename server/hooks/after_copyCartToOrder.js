function shipmentChecker(date) {
  if (moment(date).isoWeekday() === 7) {
    return moment(date).subtract(2, 'days')._d;
  } else if (moment(date).isoWeekday() === 6) {
    return moment(date).subtract(1, 'days')._d;
  }
  return date;
}

function returnChecker(date) {
  if (moment(date).isoWeekday() === 7) {
    return moment(date).add(1, 'days')._d;
  }
  return date;
}

ReactionCore.MethodHooks.after('cart/copyCartToOrder', function (options) {
  let orderId = options.result || arguments[0];
  let order = ReactionCore.Collections.Orders.findOne(orderId);
  console.log('order', order)
  let itemList = order.items;

  let afPackage = ReactionCore.Collections.Packages.findOne({
    name: 'reaction-advanced-fulfillment',
    shopId: ReactionCore.getShopId()
  });
  console.log('afPackage', afPackage)
  if (!afPackage) {
    return orderId;
  }
  if (!afPackage.settings) {
    return orderId;
  }
  if (!afPackage.settings.buffer) {
    return orderId;
  }
  let shippingBuffer = buffer.shipping;
  let shipmentDate = new Date();
  let returnDate = new Date(2100, 8, 20); // XXX: This is a hack for not dealing with items that don't have return date. Sorry future programmer!
  let returnBuffer = buffer.returning;
  if (order.startTime && order.endTime) {
    shipmentDate = moment(order.startTime).subtract(shippingBuffer, 'days')._d;
    returnDate = moment(order.endTime).add(returnBuffer, 'days')._d;
  }

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
      },
      price: item.variants.price,
      sku: item.variants.sku,
      location: item.variants.location
    };
  });
  console.log('we made past items', items);
  ReactionCore.Collections.Orders.update({_id: orderId}, {
    $set: {
      'advancedFulfillment.workflow.status': 'orderCreated',
      'advancedFulfillment.workflow.workflow': [],
      'advancedFulfillment.shipmentDate': AdvancedFulfillment.shipmentChecker(shipmentDate, false), // TODO: check for local delivery
      'advancedFulfillment.returnDate': AdvancedFulfillment.returnDateChecker(returnDate, false) // TODO: check for local delivery
    },
    $addToSet: {
      'advancedFulfillment.items': {
        $each: items
      }
    }
  });
  return orderId;
});

