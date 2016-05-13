Meteor.startup(function () {
  let afCounter = ReactionCore.Collections.AFCounter.find({
    name: 'advancedFulfillment',
    shopId: ReactionCore.getShopId()
  });
  if (afCounter.count() === 0) {
    ReactionCore.Collections.AFCounter.insert({
      name: 'advancedFulfillment',
      shopId: ReactionCore.getShopId()
    });
  }
});
