import _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { MethodHooks } from '/server/api';
import { Orders, Packages } from '/lib/collections';
import { Logger, Reaction } from '/server/api';
// import * from 'matb33:collection-hooks';
Orders.after.insert(function () {
  const order = this.transform();
  const afPackage = Packages.findOne({
    name: 'reaction-advanced-fulfillment',
    shopId: Reaction.getShopId()
  });
  if (!afPackage.enabled) {
    Logger.warn(`Backpack is not enabled, so Order ${this._id} was not updated`);
    return;
  }
  let af = {};
  advancedFulfillment = af.advancedFulfillment = {};
  advancedFulfillment.workflow = {
    status: 'orderCreated',
    workflow: []
  };
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
  // TODO Check this is now on cart!, So shouldn't need start and end time
  af.startTime = new Date();
  af.endTime = new Date();
  advancedFulfillment.arriveBy = new Date();
  advancedFulfillment.shipReturnBy = new Date();
  // advancedFulfillment.arriveBy = order.startTime;
  // advancedFulfillment.shipReturnBy = order.endTime;
  Orders.update({
    _id: this._id
  }, {
    $set: af
  });
  Logger.info(`Backpack information added to ${this._id}`);
});
