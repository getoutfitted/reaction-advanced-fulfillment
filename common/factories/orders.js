Factory.define('orderForAF', Orders,
  Factory.extend('order', {
    shipping: [{address: faker.reaction.address()}],
    billing: [{address: faker.reaction.address()}]
  })
);


