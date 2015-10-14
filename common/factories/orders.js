Factory.define('orderAF', ReactionCore.Collections.Orders, {
  // Schemas.OrderItems
  additionalField: faker.lorem.sentence(),
  status: faker.lorem.sentence(3),
  history: [],
  documents: [],

  // Schemas.Order
  cartId: Random.id(),
  notes: [],

  // Schemas.Cart
  shopId: Random.id(),
  userId: Random.id(),
  sessions: ['Session'],
  email: faker.internet.email(),
  items: [
    {
      _id: Random.id(),
      productId: Random.id(),
      shopId: Random.id(),
      quantity: _.random(1, 5),
      variants: {
        _id: Random.id(),
        compareAtPrice: _.random(0, 1000),
        weight: _.random(0, 10),
        inventoryManagement: true,
        inventoryPolicy: false,
        lowInventoryWarningThreshold: 1,
        inventoryQuantity: _.random(0, 100),
        price: _.random(10, 1000),
        optionTitle: faker.lorem.words()[0],
        title: faker.lorem.words()[0],
        sku: _.random(0, 6),
        taxable: true,
        metafields: [{
          key: faker.lorem.words()[0],
          value: faker.lorem.words()[0],
          scope: 'detail'
        }, {
          key: 'facebook',
          value: faker.lorem.paragraph(),
          scope: 'socialMessages'
        }, {
          key: 'twitter',
          value: faker.lorem.sentence(),
          scope: 'socialMessages'
        }]
      }
    }, {
      _id: Random.id(),
      productId: Random.id(),
      shopId: Random.id(),
      quantity: _.random(1, 5),
      variants: {
        _id: Random.id(),
        compareAtPrice: _.random(0, 1000),
        weight: _.random(0, 10),
        inventoryManagement: true,
        inventoryPolicy: false,
        lowInventoryWarningThreshold: 1,
        inventoryQuantity: _.random(0, 100),
        price: _.random(10, 1000),
        optionTitle: faker.lorem.words()[0],
        title: faker.lorem.words()[0],
        sku: _.random(0, 6),
        taxable: true,
        metafields: [{
          key: faker.lorem.words()[0],
          value: faker.lorem.words()[0],
          scope: 'detail'
        }, {
          key: 'facebook',
          value: faker.lorem.paragraph(),
          scope: 'socialMessages'
        }, {
          key: 'twitter',
          value: faker.lorem.sentence(),
          scope: 'socialMessages'
        }]
      }
    }
  ],
  requiresShipping: true,
  shipping: [], // Shipping Schema
  billing: [], // Payment Schema
  totalPrice: _.random(1, 1000),
  state: 'new',
  createdAt: new Date,
  updatedAt: new Date
});
