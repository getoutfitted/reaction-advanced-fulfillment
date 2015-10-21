function num() {
  return _.random(1, 5);
}
let newItemsList = _.times(num(), function () {
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

let pickedItemsList = _.times(num(), function () {
  return {
    _id: Random.id(),
    productId: Random.id(),
    shopId: Random.id(),
    variantId: Random.id(),
    quantity: _.random(1, 5),
    itemDescription: 'this is the item description',
    workflow: {
      status: 'picked',
      workflow: ['In Stock']
    }
  };
});

let packedItemsList = _.times(num(), function () {
  return {
    _id: Random.id(),
    productId: Random.id(),
    shopId: Random.id(),
    variantId: Random.id(),
    quantity: _.random(1, 5),
    itemDescription: 'this is the item description',
    workflow: {
      status: 'packed',
      workflow: ['In Stock', 'picked']
    }
  };
});

let completedItemsList = _.times(num(), function () {
  return {
    _id: Random.id(),
    productId: Random.id(),
    shopId: Random.id(),
    variantId: Random.id(),
    quantity: _.random(1, 5),
    itemDescription: 'this is the item description',
    workflow: {
      status: 'completed',
      workflow: ['In Stock', 'picked', 'packed']
    }
  };
});

function shipmentDate() {
  return moment().add(_.random(0, 3), 'days')._d;
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
      items: newItemsList
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
      items: pickedItemsList
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
      items: packedItemsList
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
      items: completedItemsList
    }
  })
);
