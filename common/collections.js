ReactionCore.Schemas.AdvancedFulfillmentItem = new SimpleSchema([ReactionCore.Schemas.ShipmentItem, {
  workflow: {
    type: ReactionCore.Schemas.Workflow,
    optional: true
  }
}]);

ReactionCore.Schemas.AdvancedFulfillment = new SimpleSchema([ReactionCore.Schemas.Order, {
  advancedFulfillment: {
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
  }
}]);

ReactionCore.Schemas.Orders.attachSchema(ReactionCore.Schemas.AdvancedFulfillment);
