
ReactionCore.Schemas.AdvancedFulfillmentPackageConfig = new SimpleSchema([
  ReactionCore.Schemas.PackageConfig, {
    'settings.buffer.shipping': {
      type: Number,
      defaultValue: 3,
      label: 'Number of days to customer receiving date that orders need to fulfilled.',
      optional: true
    },
    'settings.buffer.returning': {
      type: Number,
      defaultValue: 4,
      label: 'Number of days past the customer use date, until orders should be returned.',
      optional: true
    }
  }
]);

ReactionCore.Schemas.AdvancedFulfillmentItem = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  productId: {
    type: String,
    index: 1
  },
  shopId: {
    type: String,
    index: 1,
    optional: true
  },
  quantity: {
    type: Number,
    min: 0
  },
  variantId: {
    type: String,
    optional: true
  },
  itemDescription: {
    type: String,
    optional: true
  },
  workflow: {
    type: ReactionCore.Schemas.Workflow,
    optional: true
  },
  price: {
    type: Number,
    optional: true,
    decimal: true,
    min: 0
  },
  sku: {
    type: String,
    optional: true
  },
  location: {
    type: String,
    optional: true
  }
});

ReactionCore.Schemas.AdvancedFulfillmentObject = new SimpleSchema({
  shipmentDate: {
    type: Date,
    optional: true
  },
  returnDate: {
    type: Date,
    optional: true
  },
  workflow: {
    type: ReactionCore.Schemas.Workflow,
    optional: true
  },
  items: {
    type: [ReactionCore.Schemas.AdvancedFulfillmentItem],
    optional: true
  }
});

ReactionCore.Schemas.AdvancedFulfillment = new SimpleSchema([ReactionCore.Schemas.Orders, {
  advancedFulfillment: {
    type: ReactionCore.Schemas.AdvancedFulfillmentObject,
    optional: true
  }
}]);

ReactionCore.Collections.Orders.attachSchema(ReactionCore.Schemas.AdvancedFulfillment);
