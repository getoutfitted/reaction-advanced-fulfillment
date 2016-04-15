AdvancedFulfillment.server = {};

AdvancedFulfillment.server.permissions = [
  'admin',
  'owner',
  'dashboard/advanced-fulfillment',
  'reaction-advanced-fulfillment'
];
AdvancedFulfillment.Shipstation = {};
AdvancedFulfillment.Shipstation.createOrder = function (orderId) {
  check(orderId, String);
  const order = ReactionCore.Collections.Orders.findOne(orderId);
  if (order) {
    let shipstation = {};
    shipstation.orderNumber = order.orderNumber;
    shipstation.orderDate = order.createdAt;
    shipstation.orderStatus = 'awaiting_shipment';
    // Billing
    shipstation.billTo = billTo = {};
    let billingInfo = order.billing[0].address;
    billTo.name = billingInfo.fullname;
    billTo.street1 = billingInfo.address1;
    billTo.street2 = billingInfo.address2;
    billTo.city = billingInfo.city;
    billTo.state = billingInfo.region;
    billTo.postalCode = billingInfo.postal;
    billTo.phone = billingInfo.phone;
    billTo.residential = billingInfo.isCommercial;
    billTo.addressVerified = 'Address not yet validated';
    // Shipping
    shipstation.shipTo = shipTo = {};
    let shippingInfo = order.shipping[0].address;
    shipTo.name = shippingInfo.fullname;
    shipTo.street1 = shippingInfo.address1;
    shipTo.street2 = shippingInfo.address2;
    shipTo.city = shippingInfo.city;
    shipTo.state = shippingInfo.region;
    shipTo.postalCode = shippingInfo.postal;
    shipTo.phone = shippingInfo.phone;
    shipTo.residential = shippingInfo.isCommercial;
    shipTo.addressVerified = 'Address not yet validated';

    // Optional But wanted for Our Use!
    shipstation.shipByDate
  }
};
