const ShopId = 'test-shop-id';
function items(number) {
  return  _.times(number, function () {
    return {
      _id: Random.id(),
      shopId: ShopId,
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
  allItems.items = items(_.random(2, 4));
  allItems.afItems = importedAFItems(allItems.items);
  return allItems;
}

let newItems = createItems();

Factory.define('afUser', Meteor.users,
  Factory.extend('user', {
    roles: {
      [ShopId]: [
        'owner',
        'admin',
        'guest',
        'reaction-advanced-fulfillment',
        'dashboard/advanced-fulfillment'
      ]
    },
    services: {
      password: {
        bcrypt: Random.id(29)
      },
      resume: {
        loginTokens: [
          {
            when: moment().add(_.random(0, 31), 'days').add(_.random(0, 24),
              'hours').toDate()
          }
        ]
      }
    }
  })
);

Factory.define('importedShopifyOrder', Orders,
  Factory.extend('orderForAF', {
    shopifyOrderNumber: 1234,
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
