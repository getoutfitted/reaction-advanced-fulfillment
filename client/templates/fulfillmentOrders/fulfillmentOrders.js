Template.fulfillmentOrder.helpers({
  shippingDate: function () {
    let longDate = this.advancedFulfillment.shipmentDate;
    return moment(longDate).format('MMMM Do YYYY');
  },
  status: function () {
    return this.advancedFulfillment.workflow.status;
  }
});
