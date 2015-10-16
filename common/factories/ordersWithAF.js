let num = _.random(1, 5);
let itemsList = _.times(num, function () {
  return {
    _id: Random.id(),
    productId: Random.id(),
    shopId: Random.id(),
    variantId: Random.id(),
    quantity: _.random(1, 5),
    itemDescriptionL: 'this is the item description',
    workflow: {
      status: 'In Stock',
      workflow: []
    }
  };
});

let shipmentDate = moment().add(_.random(1, 3), 'days')._d;
let returnDate = moment().add(_.random(4, 6), 'days')._d;


Factory.define('orderWithAF', ReactionCore.Collections.Orders,
  Factory.extend('orderAF', {
    advancedFulfillment: {
      shipmentDate: shipmentDate,
      returnDate: returnDate,
      workflow: {
        status: 'orderCreated',
        workflow: []
      },
      items: itemsList
    }
  })
);

Factory.define('PickingOrderWithAF', ReactionCore.Collections.Orders,
  Factory.extend('orderAF', {
    advancedFulfillment: {
      shipmentDate: shipmentDate,
      returnDate: returnDate,
      workflow: {
        status: 'orderPicking',
        workflow: ['orderCreated']
      },
      items: itemsList
    }
  })
);

Factory.define('PackingOrderWithAF', ReactionCore.Collections.Orders,
  Factory.extend('orderAF', {
    advancedFulfillment: {
      shipmentDate: shipmentDate,
      returnDate: returnDate,
      workflow: {
        status: 'orderPacking',
        workflow: ['orderCreated', 'orderPicking']
      },
      items: itemsList
    }
  })
);

Factory.define('FulfilledOrderWithAF', ReactionCore.Collections.Orders,
  Factory.extend('orderAF', {
    advancedFulfillment: {
      shipmentDate: shipmentDate,
      returnDate: returnDate,
      workflow: {
        status: 'orderFulfilled',
        workflow: ['orderCreated', 'orderPicking', 'orderPacking']
      },
      items: itemsList
    }
  })
);
