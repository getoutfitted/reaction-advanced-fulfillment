import { Meteor } from 'meteor/meteor';
import { Reaction } from '/server/api';
import { AFCounter } from '../lib/collections';

Meteor.startup(function () {
  let afCounter = AFCounter.find({
    name: 'advancedFulfillment',
    shopId: Reaction.getShopId()
  });
  if (afCounter.count() === 0) {
    AFCounter.insert({
      name: 'advancedFulfillment',
      shopId: Reaction.getShopId()
    });
  }
});
