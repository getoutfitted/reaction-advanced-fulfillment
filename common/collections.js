
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
    index: 1,
    label: 'THE PRODUCT IN AF',
    optional: true
  },
  shopId: {
    type: String,
    index: 1,
    optional: true
  },
  quantity: {
    type: Number,
    min: 0,
    optional: true
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
  outboundTrackingNumbers: {
    type: [String],
    optional: true
  },
  outboundTrackingUrls: {
    type: [String],
    optional: true
  },
  inboundTrackingNumbers: {
    type: [String],
    optional: true
  },
  inboundTrackingUrls: {
    type: [String],
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
  },
  orderNotes: {
    type: String,
    optional: true
  }
}]);

ReactionCore.Collections.Orders.attachSchema(ReactionCore.Schemas.AdvancedFulfillment);
