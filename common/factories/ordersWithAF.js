let num = _.random(1, 5);
let itemsList = _.times(num, function () {
  return {
    _id: Random.id(),
    productId: Random.id(),
    shopId: Random.id(),
    variantId: Random.id(),
    quantity: _.random(1, 5),
    itemDescription: 'this is the item description',
    workflow: {
      status: 'In Stock',
      workflow: []
    }
  };
});

function shipmentDate() {
  return moment().add(_.random(1, 3), 'days')._d;
}
function returnDate() {
  return moment().add(_.random(4, 6), 'days')._d;
}

Factory.define('newOrder', ReactionCore.Collections.Orders,
  Factory.extend('orderForAF', {
    advancedFulfillment: {
      shipmentDate: shipmentDate(),
      returnDate: returnDate(),
      workflow: {
        status: 'orderCreated',
        workflow: []
      },
      items: itemsList
    }
  })
);

Factory.define('pickingOrder', ReactionCore.Collections.Orders,
  Factory.extend('orderForAF', {
    advancedFulfillment: {
      shipmentDate: shipmentDate(),
      returnDate: returnDate(),
      workflow: {
        status: 'orderPicking',
        workflow: ['orderCreated']
      },
      items: itemsList
    }
  })
);

Factory.define('packingOrder', ReactionCore.Collections.Orders,
  Factory.extend('orderForAF', {
    advancedFulfillment: {
      shipmentDate: shipmentDate(),
      returnDate: returnDate(),
      workflow: {
        status: 'orderPacking',
        workflow: ['orderCreated', 'orderPicking']
      },
      items: itemsList
    }
  })
);

Factory.define('fulfilledOrder', ReactionCore.Collections.Orders,
  Factory.extend('orderForAF', {
    advancedFulfillment: {
      shipmentDate: shipmentDate(),
      returnDate: returnDate(),
      workflow: {
        status: 'orderFulfilled',
        workflow: ['orderCreated', 'orderPicking', 'orderPacking']
      },
      items: itemsList
    }
  })
);
