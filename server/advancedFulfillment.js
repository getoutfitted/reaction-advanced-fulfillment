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
    shipstation.shipByDate = order.advancedFulfillment.shipmentDate;
    // shipstation.customerUsername = order.billing[0].address.fullName;
    shipstation.customerEmail = order.email || null;
    shipstation.amountPaid = order.billing[0].invoice.total;
    shipstation.shippingAmount = order.billing[0].invoice.shipping;
    shipstation.taxAmount = order.billing[0].invoice.taxes;
    shipstation.items = [];
    _.each(order.items, function (item, index) {
      let i = {
        orderItemId: index + 1,
        lineItemKey: item._id,
        name: item.variants.title,
        sku: item.variants.sku || item.variants.title,
        quantity: item.quantity,
        unitPrice: item.variants.price,
        weight: {
          value: item.variants.weight,
          units: "pounds"
        },
        taxAmount: 0,
        shippingAmount: 0,
        imageUrl: null,
        warehouseLocation: item.variants.location,
        productId: null,
        fulfillmentSku: item.variants.title,
        adjustment: false,
        upc: "32-65-98",
        options: [
          {
            name: 'size',
            value: item.variants.size
          },
          {
            name: 'color',
            value: item.variants.color
          }
        ],
        createDate: order.createdAt,
        modifyDate: order.createdAt
      }
      shipstation.items.push(i);
    });
  //   shipstation.items = [
  //   {
  //     "orderItemId": 192210956,
  //     "lineItemKey": "vd08-MSLbtx",
  //     "sku": "ABC123",
  //     "name": "Test item #1",
  //     "imageUrl": null,
  //     "weight": {
  //       "value": 24,
  //       "units": "ounces"
  //     },
  //     "quantity": 2,
  //     "unitPrice": 99.99,
  //     "taxAmount": 2.5,
  //     "shippingAmount": 5,
  //     "warehouseLocation": "Aisle 1, Bin 7",
  //     "options": [
  //       {
  //         "name": "Size",
  //         "value": "Large"
  //       }
  //     ],
  //     "productId": null,
  //     "fulfillmentSku": null,
  //     "adjustment": false,
  //     "upc": "32-65-98",
  //     "createDate": "2016-02-16T15:16:53.707",
  //     "modifyDate": "2016-02-16T15:16:53.707"
  //   },
  //   {
  //     "orderItemId": 192210957,
  //     "lineItemKey": null,
  //     "sku": "DISCOUNT CODE",
  //     "name": "10% OFF",
  //     "imageUrl": null,
  //     "weight": {
  //       "value": 0,
  //       "units": "ounces"
  //     },
  //     "quantity": 1,
  //     "unitPrice": -20.55,
  //     "taxAmount": null,
  //     "shippingAmount": null,
  //     "warehouseLocation": null,
  //     "options": [],
  //     "productId": null,
  //     "fulfillmentSku": "SKU-Discount",
  //     "adjustment": true,
  //     "upc": null,
  //     "createDate": "2016-02-16T15:16:53.707",
  //     "modifyDate": "2016-02-16T15:16:53.707"
  //   }
  // ],
    Shipstation.createOrder(shipstation);
  }
};
