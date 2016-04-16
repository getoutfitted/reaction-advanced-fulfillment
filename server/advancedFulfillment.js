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
    // let shipstation = {
    //   orderNumber: 40,
    //   orderDate: new Date(),
    //   orderStatus: 'awaiting_shipment',
    //   billTo: {
    //     name: 'Paul Grever',
    //     company: 'GetOutfitted',
    //     street1: '460 S Marion pkwy',
    //     street2: '1602C',
    //     street3: null,
    //     city: 'Denver',
    //     state: 'CO',
    //     postalCode: '80209',
    //     phone: '6082392471',
    //     residential: true,
    //     addressVerified: 'Address validated successfully'
    //   },
    //   shipTo: {
    //     name: 'Paul Grever',
    //     company: 'GetOutfitted',
    //     street1: '460 S Marion pkwy',
    //     street2: '1602C',
    //     street3: null,
    //     city: 'Denver',
    //     state: 'CO',
    //     postalCode: '80209',
    //     phone: '6082392471',
    //     residential: true,
    //     addressVerified: 'Address validated successfully'
    //   }
    // };
    let shipstation = {};
    shipstation.orderNumber = order.orderNumber;
    shipstation.orderDate = order.createdAt;
    shipstation.orderStatus = 'awaiting_shipment';
    // Billing
    shipstation.billTo = billTo = {};
    let billingInfo = order.billing[0].address;
    billTo.name = billingInfo.fullName;
    billTo.street1 = billingInfo.address1;
    billTo.street2 = billingInfo.address2;
    billTo.street3 = null;
    billTo.city = billingInfo.city;
    billTo.state = billingInfo.region;
    billTo.postalCode = billingInfo.postal;
    billTo.phone = billingInfo.phone;
    billTo.company = null;
    billTo.residential = billingInfo.isCommercial;
    billTo.addressVerified = 'Address not yet validated';
    // Shipping
    shipstation.shipTo = shipTo = {};
    let shippingInfo = order.shipping[0].address;
    shipTo.name = shippingInfo.fullName;
    shipTo.street1 = shippingInfo.address1;
    shipTo.street2 = shippingInfo.address2;
    // shipTo.street3 = null;
    shipTo.city = shippingInfo.city;
    shipTo.state = shippingInfo.region;
    shipTo.postalCode = shippingInfo.postal;
    shipTo.phone = shippingInfo.phone;
    shipTo.residential = shippingInfo.isCommercial;
    // shipTo.company = null;
    shipTo.addressVerified = 'Address not yet validated';

    // Optional But wanted for Our Use!
    // shipstation.shipByDate = order.advancedFulfillment.shipmentDate;
    // shipstation.customerUsername = order.billing[0].address.fullName;
    // shipstation.customerEmail = order.email || 'Email Not Provided';
    // shipstation.amountPaid = order.billing[0].invoice.total;
    // shipstation.shippingAmount = order.billing[0].invoice.shipping;
    // shipstation.taxAmount = order.billing[0].invoice.taxes;
    // shipstation.items = [];
    // _.each(order.items, function (item) {
    //   let i = {
    //     orderItemId: item._id,
    //     lineItemKey: item.productId,
    //     quantity: item.quantity,
    //     unitPrice: item.variants.price,
    //     weight: {
    //       value: item.variants.weight,
    //       units: "pounds"
    //     },
    //     warehouseLocation: item.variants.location,
    //     productId: item.variants._id,
    //     options: [
    //       {
    //         name: 'size',
    //         value: item.variants.size
    //       },
    //       {
    //         name: 'color',
    //         value: item.variants.color
    //       }
    //     ]
    //   }
    //   shipstation.items.push(i);
    // });
    Shipstation.createOrder(shipstation);
  }
};
