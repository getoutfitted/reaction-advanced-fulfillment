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
  let itemList = order.items;
  console.log('orderID', order._id);
  let afPackage = ReactionCore.Collections.Packages.findOne({
    name: 'reaction-advanced-fulfillment',
    shopId: ReactionCore.getShopId()
  });
  if (!afPackage) {
    return orderId;
  }
  if (!afPackage.settings) {
    return orderId;
  }
  if (!afPackage.settings.buffer) {
    return orderId;
  }

// Transit time and local delivery checker
  let shippingAddress = {};
  shippingAddress.address1 = order.shipping[0].address.address1;
  if (order.shipping[0].address.address2) {
    shippingAddress.address2 = order.shipping[0].address.address2;
  }
  shippingAddress.city = order.shipping[0].address.city;
  shippingAddress.region = order.shipping[0].address.region;
  shippingAddress.postal = order.shipping[0].address.postal;
  shippingAddress.country = order.shipping[0].address.country;
  let localDelivery = AdvancedFulfillment.determineLocalDelivery(order.shipping[0].address.postal);
  let transitTime;
  localDelivery ? transitTime = 0 : transitTime  = AdvancedFulfillment.FedExApi.getFedexTransitTime(shippingAddress);



  // let shippingBuffer = buffer.shipping;
  // let shipmentDate = new Date();
  // let returnDate = new Date(2100, 8, 20); // XXX: This is a hack for not dealing with items that don't have return date. Sorry future programmer!
  // let returnBuffer = buffer.returning;
  // if (order.startTime && order.endTime) {
  //   shipmentDate = moment(order.startTime).subtract(shippingBuffer, 'days')._d;
  //   returnDate = moment(order.endTime).add(returnBuffer, 'days')._d;
  // }

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
  console.log('item', items);
  ReactionCore.Collections.Orders.update({_id: orderId}, {
    $set: {
      'advancedFulfillment.workflow.status': 'orderCreated',
      'advancedFulfillment.workflow.workflow': [],
      'advancedFulfillment.transitTime': transitTime,
      'advancedFulfillment.localDelivery': localDelivery,
      'advancedFulfillment.items': items,
    }
  });
  return orderId;
});

