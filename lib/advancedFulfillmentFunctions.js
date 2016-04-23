
AdvancedFulfillment.itemsToAFItems = function (items) {
  check(items, [Object]);
  return _.map(items, function (item) {
    let product = ReactionCore.Collections.Products.findOne(item.productId);
    let itemDescription = item.variants.title;
    if (product && product.gender && product.vendor) {
      itemDescription = product.gender + ' - ' + product.vendor + ' - ' + product.title;
    }
    return {
      _id: item._id,
      productId: item.productId,
      ancestors: item.variants.ancestors,
      shopId: item.shopId,
      quantity: item.quantity,
      variantId: item.variants._id,
      functionalType: item.variants.functionalType,
      itemDescription: itemDescription,
      workflow: {
        status: 'In Stock',
        workflow: []
      },
      price: item.variants.price,
      sku: item.variants.sku,
      location: item.variants.location,
      color: item.variants.color,
      size: item.variants.size
    };
  });
};

AdvancedFulfillment.findAndUpdateNextOrderNumber = function () {
  let counter = AFCounter.findOne({
    name: 'advancedFulfillment',
    shopId: ReactionCore.getShopId()
  });
  if (counter) {
    AFCounter.update({
      _id: counter._id
    }, {
      $inc: {seq: 1}
    });
    return counter.seq;
  }
};

AdvancedFulfillment.findHighestOrderNumber = function () {
  let order = Orders.findOne({}, {sort: {orderNumber: -1}});
  let nextOrder = order.orderNumber + 1;
  AFCounter.update({
    name: 'advancedFulfillment',
    shopId: ReactionCore.getShopId()
  }, {
    $set: {seq: nextOrder + 1}
  });
  return nextOrder;
};
