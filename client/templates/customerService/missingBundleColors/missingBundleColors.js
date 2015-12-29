Template.missingBundleColors.helpers({
  missingBundleInfo: function () {
    return ReactionCore.Collections.Orders.find({
      bundleMissingColor: true
    });
  }
});

Template.missingBundleColors.events({
  'click .confirm-bundle': function (event) {
    event.preventDefault();
    let orderId = this._id;
    let userId = Meteor.userId();
    Meteor.call('advancedFulfillment/bundleColorConfirmation', orderId, userId);
  }
});
