function items(number) {
  return  _.times(number, function () {
    return {
      _id: Random.id(),
      shopId: Random.id(),
      productId: Random.id(),
      quantity: _.random(1, 3),
      variants: {
        _id: Random.id(),
        parentId: Random.id(),
        type: 'variant',
        sku: 'SG001',
        manufacturerSku: 'SG001',
        location: 'A' + _.random(1, 11),
        color: 'Black',
        size: 'One Size',
        title: 'size',
        optionTitle: 'One Size',
        inventoryQuantity: 100,
        compareAtPrice: 1,
        price: 1,
        pricePerDay: 1,
        taxable: true,
        weight: 1,
        inventoryManagement: true,
        inventoryPolicy: true
      },
      workflow: {
        status: 'orderCreated',
        workflow: ['inventoryAdjusted']
      }
    };
  });
}

function importedAFItems(items) {
  return _.map(items, function (item) {
    return {
      _id: item._id,
      productId: item.productId,
      shopId: item.shopId,
      quantity: item.quantity,
      variantId: item.variants._id,
      price: item.variants.price,
      sku: item.variants.sku,
      customerName: 'Fidelio',
      location: item.variants.location,
      itemDescription: 'Mens - Smith - Vice',
      workflow: {
        status: 'In Stock',
        workflow: []
      }
    };
  });
}

function createItems() {
  let allItems = {};
  allItems.items = items(_.random(1, 3));
  allItems.afItems = importedAFItems(allItems.items);
  return allItems;
}

let newItems = createItems();

Factory.define('importedShopifyOrder', Orders,
  Factory.extend('orderForAF', {
    infoMissing: false,
    itemMissingDetails: false,
    bundleMissingColor: false,
    startTime: moment().add(4, 'day').toDate(),
    endTime: moment().add(8, 'day').toDate(),
    items: newItems.items,
    advancedFulfillment: {
      localDelivery: false,
      skiPackages: [],
      skiPackagesPurchased: false,
      transitTime: 1,
      arriveBy: moment().add(3, 'day').toDate(),
      shipReturnBy: moment().add(9, 'day').toDate(),
      shipmentDate: moment().add(2, 'day').toDate(),
      returnDate: moment().add(11, 'day').toDate(),
      items: newItems.afItems,
      workflow: {
        status: 'orderCreated'
      },
      damageCoverage: {
        packages: {
          qty: 0,
          subtotal: 0
        },
        products: {
          qty: 0,
          subtotal: 0
        }
      }
    }
  })
);
function num() {
  return _.random(1, 5);
}

function newItemsList(number) {
  return  _.times(number, function () {
    return {
      _id: Random.id(),
      productId: Random.id(),
      shopId: Random.id(),
      variantId: Random.id(),
      quantity: _.random(1, 5),
      itemDescription: faker.commerce.productName(),
      price: _.random(100, 1500) / 100,
      workflow: {
        status: 'In Stock',
        workflow: []
      }
    };
  });
}

function newItemsSkuLocationList(number) {
  return  _.times(number, function () {
    return {
      _id: Random.id(),
      productId: Random.id(),
      shopId: Random.id(),
      variantId: Random.id(),
      quantity: _.random(1, 5),
      itemDescription: faker.commerce.productName(),
      price: _.random(100, 1500) / 100,
      workflow: {
        status: 'In Stock',
        workflow: []
      },
      sku: faker.name.firstName().substr(0, 2) + '-' + _.random(100, 1000),
      location: faker.name.firstName().substr(0, 2) + '-L' + _.random(1, 9) + '-C' + _.random(1, 9)
    };
  });
}

function pickedItemsList(number) {
  return _.times(number, function () {
    return {
      _id: Random.id(),
      productId: Random.id(),
      shopId: Random.id(),
      variantId: Random.id(),
      quantity: _.random(1, 5),
      itemDescription: faker.commerce.productName(),
      price: _.random(100, 1500) / 100,
      workflow: {
        status: 'picked',
        workflow: ['In Stock']
      }
    };
  });
}

function packedItemsList(number) {
  return _.times(number, function () {
    return {
      _id: Random.id(),
      productId: Random.id(),
      shopId: Random.id(),
      variantId: Random.id(),
      quantity: _.random(1, 5),
      itemDescription: faker.commerce.productName(),
      price: _.random(100, 1500) / 100,
      workflow: {
        status: 'packed',
        workflow: ['In Stock', 'picked']
      }
    };
  });
}

function shippedItemsList(number) {
  return _.times(number, function () {
    return {
      _id: Random.id(),
      productId: Random.id(),
      shopId: Random.id(),
      variantId: Random.id(),
      quantity: _.random(1, 5),
      itemDescription: faker.commerce.productName(),
      price: _.random(100, 1500) / 100,
      workflow: {
        status: 'shipped',
        workflow: ['In Stock', 'picked', 'packed']
      },
      sku: faker.name.firstName().substr(0, 2) + '-' + _.random(100, 1000),
      location: faker.name.firstName().substr(0, 2) + '-L' + _.random(1, 9) + '-C' + _.random(1, 9)
    };
  });
}

function shipmentDate() {
  return moment().add(_.random(0, 3), 'days')._d;
}
function returnDate() {
  return moment().add(_.random(4, 6), 'days')._d;
}


// Factory.define('newOrder', ReactionCore.Collections.Orders,
//   Factory.extend('orderForAF', {
//     advancedFulfillment: {
//       shipmentDate: shipmentDate(),
//       returnDate: returnDate(),
//       workflow: {
//         status: 'orderCreated',
//         workflow: []
//       },
//       items: newItemsList(num())
//     }
//   })
// );

// Factory.define('orderSKU', ReactionCore.Collections.Orders,
//   Factory.extend('orderForAF', {
//     advancedFulfillment: {
//       shipmentDate: shipmentDate(),
//       returnDate: returnDate(),
//       workflow: {
//         status: 'orderCreated',
//         workflow: []
//       },
//       items: newItemsSkuLocationList(5)
//     }
//   })
// );

// Factory.define('pickingOrder', ReactionCore.Collections.Orders,
//   Factory.extend('orderForAF', {
//     advancedFulfillment: {
//       shipmentDate: shipmentDate(),
//       returnDate: returnDate(),
//       workflow: {
//         status: 'orderPicking',
//         workflow: ['orderCreated']
//       },
//       items: pickedItemsList(num())
//     }
//   })
// );

// Factory.define('packingOrder', ReactionCore.Collections.Orders,
//   Factory.extend('orderForAF', {
//     advancedFulfillment: {
//       shipmentDate: shipmentDate(),
//       returnDate: returnDate(),
//       workflow: {
//         status: 'orderPacking',
//         workflow: ['orderCreated', 'orderPicking']
//       },
//       items: packedItemsList(num())
//     }
//   })
// );

// Factory.define('todaysReturns', ReactionCore.Collections.Orders,
//   Factory.extend('orderForAF', {
//     advancedFulfillment: {
//       shipmentDate: new Date(2015, 9, 28),
//       returnDate: new Date(),
//       workflow: {
//         status: 'orderShipping',
//         workflow: ['orderCreated', 'orderPicking', 'orderPacking', 'orderFulfilled']
//       },
//       items: shippedItemsList(num())
//     }
//   })
// );


// Factory.define('fulfilledOrder', ReactionCore.Collections.Orders,
//   Factory.extend('orderForAF', {
//     advancedFulfillment: {
//       shipmentDate: shipmentDate(),
//       returnDate: returnDate(),
//       workflow: {
//         status: 'orderFulfilled',
//         workflow: ['orderCreated', 'orderPicking', 'orderPacking']
//       },
//       items: packedItemsList(num())
//     }
//   })
// );
