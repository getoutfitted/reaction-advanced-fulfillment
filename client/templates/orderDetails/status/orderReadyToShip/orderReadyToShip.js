Template.orderReadyToShip.events({
  'click .update-to-shipped': function (event) {
    event.preventDefault();
    let orderId = this._id;
    let userId = Meteor.userId();
    let noRentals = _.every(this.advancedFulfillment.items, function (afItem) {
      return afItem.functionalType === 'variant';
    });
    let orderReadyToShip = this.advancedFulfillment.workflow.status === 'orderReadyToShip';
    if (orderReadyToShip && noRentals) {
      Meteor.call('advancedFulfillment/bypassWorkflowAndComplete', orderId, userId);
    } else {
     Meteor.call('advancedFulfillment/updateOrderWorkflow', orderId, userId, 'orderReadyToShip');
    }
  }
});
