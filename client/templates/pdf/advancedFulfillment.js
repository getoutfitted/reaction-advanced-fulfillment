Template.advancedFulfillmentPDF.helpers({
  shippingDate: function () {
    let date = this.advancedFulfillment.shipmentDate;
    return moment(date).format('MMMM Do, YYYY');
  },
  returnDate: function () {
    let date = this.advancedFulfillment.returnDate;
    return moment(date).format('MMMM Do, YYYY');
  },
  shippingAddress: function () {
    return this.shipping[0].address;
  },
  billingAddress: function () {
    return this.billing[0].address;
  }
});
