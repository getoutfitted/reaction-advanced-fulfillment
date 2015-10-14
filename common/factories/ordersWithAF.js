Factory.define('orderWithAdvancedFullfillment', ReactionCore.Collections.Orders,
  Factory.extend('orderAF', {
    advancedFulfillment: {
      shipmentDate: moment().add(2, 'days')._d,
      returnDate: moment().add(7, 'days')._d,
      workflow: {
        status: 'orderCreated',
        workflow: []
      }
    }
  })
);
