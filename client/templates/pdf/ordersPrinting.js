Template.advancedFulfillmentOrdersPrint.helpers({
  humanReadableDate: function (day) {
    // let date = this.advancedFulfillment.shipmentDate;
    return moment(day).format('MMMM Do, YYYY');
  },
  shippingAddress: function (order) {
    return order.shipping[0].address;
  },
  billingAddress: function (order) {
    return order.billing[0].address;
  }
});
