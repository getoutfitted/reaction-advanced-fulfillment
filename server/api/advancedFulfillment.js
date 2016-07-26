import _ from 'underscore';
import { check } from 'meteor/check';
import { Reaction } from '/server/api';
import { Products, Orders } from '/lib/collections';
import { AFCounter } from '../../lib/collections';
// import * as commonAdvancedFulfillment from '../../lib/api';
import AdvancedFulfillment from '../../lib/api';

AdvancedFulfillment.itemsToAFItems = function (items) {
  check(items, [Object]);
  return _.map(items, function (item) {
    let product = Products.findOne(item.productId);
    let itemDescription = item.variants.title;
    if (product && product.gender && product.vendor) {
      itemDescription = product.gender + ' - ' + product.vendor + ' - ' + product.title;
    }
    return {
      _id: item._id,
      productId: item.productId,
      ancestors: item.variants.ancestors,
      shopId: item.shopId,
      quantity: item.quantity,
      variantId: item.variants._id,
      functionalType: item.variants.functionalType,
      itemDescription: itemDescription,
      workflow: {
        status: 'In Stock',
        workflow: []
      },
      price: item.variants.price,
      sku: item.variants.sku,
      location: item.variants.location,
      color: item.variants.color,
      size: item.variants.size
    };
  });
};

AdvancedFulfillment.findAndUpdateNextOrderNumber = function () {
  let counter = AFCounter.findOne({
    name: 'advancedFulfillment',
    shopId: Reaction.getShopId()
  });
  if (counter) {
    AFCounter.update({
      _id: counter._id
    }, {
      $inc: {seq: 1}
    });
    return counter.seq;
  }
};

AdvancedFulfillment.findHighestOrderNumber = function () {
  let order = Orders.findOne({}, {sort: {orderNumber: -1}});
  let nextOrder = order.orderNumber + 1;
  AFCounter.update({
    name: 'advancedFulfillment',
    shopId: Reaction.getShopId()
  }, {
    $set: {seq: nextOrder + 1}
  });
  return nextOrder;
};

AdvancedFulfillment.server = {};

AdvancedFulfillment.server.permissions = [
  'admin',
  'owner',
  'dashboard/advanced-fulfillment',
  'reaction-advanced-fulfillment'
];

// fields definitions for publications and collection pulls
AdvancedFulfillment.fields = {};

AdvancedFulfillment.fields.ordersList = {
  '_id': 1,
  'shopifyOrderNumber': 1,
  'startTime': 1,
  'advancedFulfillment.returnDate': 1,
  'advancedFulfillment.shipmentDate': 1,
  'advancedFulfillment.workflow.status': 1,
  'advancedFulfillment.items._id': 1,
  'advancedFulfillment.items.workflow': 1,
  'advancedFulfillment.arriveBy': 1,
  'history': 1,
  'shipping.address.region': 1,
  'shipping.address.city': 1,
  'shipping.address.fullName': 1,
  'advancedFulfillment.localDelivery': 1,
  'advancedFulfillment.rushDelivery': 1,
  'advancedFulfillment.kayakRental.vendor': 1,
  'advancedFulfillment.kayakRental.qty': 1,
  'advancedFulfillment.rushShippingPaid': 1,
  'infoMissing': 1,
  'itemMissingDetails': 1,
  'bundleMissingColor': 1,
  'advancedFulfillment.impossibleShipDate': 1,
  'orderNumber': 1
};

AdvancedFulfillment.fields.custServOrders = {
  '_id': 1,
  'shopifyOrderNumber': 1,
  'startTime': 1,
  'endTime': 1,
  'rentalDays': 1,
  'advancedFulfillment.returnDate': 1,
  'advancedFulfillment.shipmentDate': 1,
  'advancedFulfillment.workflow.status': 1,
  'advancedFulfillment.items._id': 1,
  'advancedFulfillment.items.workflow': 1,
  'advancedFulfillment.arriveBy': 1,
  'history': 1,
  'shipping.address.region': 1,
  'shipping.address.city': 1,
  'shipping.address.fullName': 1,
  'orderNumber': 1
};

// AdvancedFulfillment.Shipstation = {};
// AdvancedFulfillment.Shipstation.createOrder = function (orderId) {
//   check(orderId, String);
//   const order = ReactionCore.Collections.Orders.findOne(orderId);
//   if (order) {
//     let shipstation = {};
//     shipstation.orderNumber = order.orderNumber;
//     shipstation.orderDate = order.createdAt;
//     shipstation.orderStatus = 'awaiting_shipment';
//     // Billing
//     shipstation.billTo = billTo = {};
//     let billingInfo = order.billing[0].address;
//     billTo.name = billingInfo.fullName;
//     billTo.street1 = billingInfo.address1;
//     billTo.street2 = billingInfo.address2;
//     billTo.street3 = null;
//     billTo.city = billingInfo.city;
//     billTo.state = billingInfo.region;
//     billTo.postalCode = billingInfo.postal;
//     billTo.phone = billingInfo.phone;
//     billTo.company = null;
//     billTo.residential = billingInfo.isCommercial;
//     billTo.addressVerified = 'Address not yet validated';
//     // Shipping
//     shipstation.shipTo = shipTo = {};
//     let shippingInfo = order.shipping[0].address;
//     shipTo.name = shippingInfo.fullName;
//     shipTo.street1 = shippingInfo.address1;
//     shipTo.street2 = shippingInfo.address2;
//     // shipTo.street3 = null;
//     shipTo.city = shippingInfo.city;
//     shipTo.state = shippingInfo.region;
//     shipTo.postalCode = shippingInfo.postal;
//     shipTo.phone = shippingInfo.phone;
//     shipTo.residential = shippingInfo.isCommercial;
//     // shipTo.company = null;
//     shipTo.addressVerified = 'Address not yet validated';

//     // Optional But wanted for Our Use!
//     shipstation.shipByDate = order.advancedFulfillment.shipmentDate;
//     // shipstation.customerUsername = order.billing[0].address.fullName;
//     shipstation.customerEmail = order.email || null;
//     shipstation.amountPaid = order.billing[0].invoice.total;
//     shipstation.shippingAmount = order.billing[0].invoice.shipping;
//     shipstation.taxAmount = order.billing[0].invoice.taxes;
//     shipstation.items = [];
//     _.each(order.items, function (item, index) {
//       let i = {
//         orderItemId: index + 1,
//         lineItemKey: item._id,
//         name: item.variants.title,
//         sku: item.variants.sku || item.variants.title,
//         quantity: item.quantity,
//         unitPrice: item.variants.price,
//         weight: {
//           value: item.variants.weight,
//           units: "pounds"
//         },
//         taxAmount: 0,
//         shippingAmount: 0,
//         imageUrl: null,
//         warehouseLocation: item.variants.location || null,
//         productId: null,
//         fulfillmentSku: item.variants.title,
//         adjustment: false,
//         upc: "32-65-98",
//         options: [
//           {
//             name: 'size',
//             value: item.variants.size || 'One Size'
//           },
//           {
//             name: 'color',
//             value: item.variants.color || 'No Color'
//           }
//         ],
//         createDate: order.createdAt,
//         modifyDate: order.createdAt
//       };
//       shipstation.items.push(i);
//     });
//     Shipstation.createOrder(shipstation);
//   }
// };
export default AdvancedFulfillment;
