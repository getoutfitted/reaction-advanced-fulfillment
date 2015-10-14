let num = _.random(1, 5);
let itemsList = _.times(num, function () {
  return {
    _id: Random.id(),
    productId: Random.id(),
    shopId: Random.id(),
    variantId: Random.id(),
    quantity: _.random(1, 5),
    workflow: {
      status: 'In Stock',
      workflow: []
    }
  };
});


Factory.define('orderWithAF', ReactionCore.Collections.Orders,
  Factory.extend('orderAF', {
    advancedFulfillment: {
      shipmentDate: moment().add(2, 'days')._d,
      returnDate: moment().add(7, 'days')._d,
      workflow: {
        status: 'orderCreated',
        workflow: []
      },
      items: itemsList
    }
  })
);


