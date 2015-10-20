Factory.define('orderForAF', ReactionCore.Collections.Orders,
  Factory.extend('order', {
    shipping: [faker.reaction.address()]
  })
);
