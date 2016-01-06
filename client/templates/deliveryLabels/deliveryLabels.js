Template.deliveryLabels.helpers({
  deliveryMissed: function () {
    return new Date() > this.advancedFulfillment.shipmentDate;
  }
});
