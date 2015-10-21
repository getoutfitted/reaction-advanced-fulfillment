Factory.define('orderForAF', ReactionCore.Collections.Orders,
  Factory.extend('order', {
    shipping: [{address: faker.reaction.address()}]
  })
);
