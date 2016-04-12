Template.orderReadyToShip.events({
  'click .update-to-shipped': function (event) {
    event.preventDefault();
    let orderId = this._id;
    let userId = Meteor.userId();
    let noRentals = _.every(this.items, function (item) {
      return item.variants.functionalType === 'variant';
    });
    if (this.advancedFulfillment.workflow.status === 'orderReadyToShip' && noRentals) {
      Meteor.call('advancedFulfillment/bypassWorkflowAndComplete', orderId, userId);
    } else {
     Meteor.call('advancedFulfillment/updateOrderWorkflow', orderId, userId, 'orderReadyToShip');
    }
  }
});
