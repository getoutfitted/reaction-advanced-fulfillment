import { Meteor } from 'meteor/meteor';
import { MethodHooks } from '/server/api';

import { Orders } from '/lib/collections';
// import * from 'matb33:collection-hooks';
Orders.after.insert(function () {
  console.log('we made it in after order hook!', this._id);
  console.log('what is this?', this.transform());

});

// MethodHooks.after('cart/copyCartToOrder', function (options) {
//   console.log('we got here!!');
  // const orderId = options.result || options.arguments[0];
  // const order = ReactionCore.Collections.Orders.findOne(orderId);
  // const afPackage = ReactionCore.Collections.Packages.findOne({
  //   name: 'reaction-advanced-fulfillment',
  //   shopId: ReactionCore.getShopId()
  // });

  // let af = {};
  // advancedFulfillment = af.advancedFulfillment = {};
  // advancedFulfillment.workflow = {
  //   status: 'orderCreated',
  //   workflow: []
  // };

  // const shippingAddress = TransitTimes.formatAddress(order.shipping[0].address); // XXX: do we need this?
  // // check if local delivery
  // advancedFulfillment.transitTime = TransitTimes.calculateTransitTime(shippingAddress);
  // advancedFulfillment.localDelivery = TransitTimes.isLocalDelivery(shippingAddress.postal);
  // advancedFulfillment.items = AdvancedFulfillment.itemsToAFItems(order.items);

  // let orderHasNoRentals = _.every(order.items, function (item) {
  //   return item.variants.functionalType === 'variant';
  // });

  // if (orderHasNoRentals) {
  //   let today = new Date();
  //   advancedFulfillment.shipmentDate = TransitTimes.date.nextBusinessDay(today);
  // } else {
  //   if (!order.startTime || !order.endTime) {
  //     ReactionCore.Log.error(`Order: ${order._id} came through without a start or end time`);
  //     // Log CS Issue and Report to Dev Team
  //   }

  //   af.startTime = order.startTime;
  //   af.endTime = order.endTime;

  //   advancedFulfillment.arriveBy = order.startTime;
  //   advancedFulfillment.shipReturnBy = order.endTime;
  //   advancedFulfillment.shipmentDate = TransitTimes.calculateShippingDayByOrder(order);
  //   advancedFulfillment.returnDate = TransitTimes.calculateReturnDayByOrder(order);
  // }
  // // Let's abstract the order number parts of this to a standalone package
  // af.orderNumber = AdvancedFulfillment.findAndUpdateNextOrderNumber();

  // try {
  //   ReactionCore.Collections.Orders.update({
  //     _id: orderId
  //   }, {
  //     $set: af
  //   });
  // } catch (error) {
  //   af.orderNumber = AdvancedFulfillment.findHighestOrderNumber();
  //   ReactionCore.Collections.Orders.update({
  //     _id: orderId
  //   }, {
  //     $set: af
  //   });
  // }
  // // Shipstation Utilization
  // if (afPackage.settings.shipstation) {
  //   AdvancedFulfillment.Shipstation.createOrder(orderId);
  // }
  // // Klaviyo Integration
  // if (afPackage.settings.klaviyo && order.email) {
  //   Meteor.call('advancedFulfullment/createKlaviyoGeneralEvent', orderId, 'Checkout');
  // }
  // if (afPackage.settings.slack && afPackage.settings.slackChannel) {
  //   Meteor.call('advancedFulfullment/slackMessage', orderId, afPackage.settings.slackChannel);
  // }

  // return orderId;
// });
