import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { PackageConfig } from '/lib/collections/schemas/registry';
import { Order, Workflow} from '/lib/collections';

export const AdvancedFulfillmentPackageConfig = new SimpleSchema([
  PackageConfig, {
    'settings.shipstation': {
      type: Boolean,
      label: 'Enable Intrgration from Shipstation Package',
      optional: true
    },
    'settings.aftership.enabled': {
      type: Boolean,
      label: 'Enable Aftership webhook',
      optional: true
    },
    'settings.aftership.preSharedKey': {
      type: String,
      label: 'Pre Shared Key for authenticating webhooks',
      optional: true
    },
    'settings.klaviyo': {
      type: Boolean,
      label: 'Enable Klaviyo Event Triggers'
    },
    'settings.slack': {
      type: Boolean,
      label: 'Enable Slack Messaging'
    },
    'settings.slackChannel': {
      type: String,
      label: 'Choose Slack Channel to Post In',
      optional: true
    }
  }
]);

export const AdvancedFulfillmentAfterShipShippingHistory = new SimpleSchema({
  city: {
    type: String,
    optional: true
  },
  state: {
    type: String,
    optional: true
  },
  message: {
    type: String,
    optional: true
  },
  status: {
    type: String,
    optional: true
  },
  checkPointTime: {
    type: Date,
    optional: true
  }
});

export const AdvancedFulfillmentAfterShip = new SimpleSchema({
  currentStatus: {
    type: String,
    optional: true
  },
  currentMessage: {
    type: String,
    optional: true
  },
  trackingNumber: {
    type: String,
    optional: true
  },
  currentCity: {
    type: String,
    optional: true
  },
  currentState: {
    type: String,
    optional: true
  },
  history: {
    type: [AdvancedFulfillmentAfterShipShippingHistory],
    optional: true
  }
});

export const AdvancedFulfillmentItem = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  ancestors: {
    type: [String],
    optional: true
  },
  functionalType: {
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
  color: {
    type: String,
    optional: true
  },
  size: {
    type: String,
    optional: true
  },
  workflow: {
    type: Workflow,
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
  },
  bundleName: {
    type: String,
    optional: true
  },
  customerName: {
    type: String,
    optional: true
  }
});

export const AdvancedFulfillmentObject = new SimpleSchema({
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
    type: Workflow,
    optional: true
  },
  items: {
    type: [AdvancedFulfillmentItem],
    optional: true
  },
  arriveBy: {
    type: Date,
    optional: true
  },
  shipReturnBy: {
    type: Date,
    optional: true
  },
  transitTime: {
    type: Number,
    optional: true
  },
  localDelivery: {
    type: Boolean,
    optional: true
  },
  rushDelivery: {
    type: Boolean,
    optional: true
  },
  impossibleShipDate: {
    type: Boolean,
    optional: true
  },
  shippingHistory: {
    type: AdvancedFulfillmentAfterShip,
    optional: true
  }
});

export const AdvancedFulfillment = new SimpleSchema([Order, {
  advancedFulfillment: {
    type: AdvancedFulfillmentObject,
    optional: true
  },
  orderNotes: {
    type: String,
    optional: true
  },
  orderNumber: {
    type: Number,
    optional: true,
    unique: true,
    index: true
  },
  startTime: {
    type: Date,
    optional: true
  },
  endTime: {
    type: Date,
    optional: true
  }
}]);
