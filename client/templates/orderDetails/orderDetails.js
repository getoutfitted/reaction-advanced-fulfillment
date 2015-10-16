Template.orderDetails.helpers({
  status: function () {
    return this.advancedFulfillment.workflow.status;
  },
  shippingDate: function () {
    let date = this.advancedFulfillment.shipmentDate;
    return moment(date).format('MMMM Do, YYYY');
  },
  returnDate: function () {
    let date = this.advancedFulfillment.returnDate;
    return moment(date).format('MMMM Do, YYYY');
  }
});
Template.itemDetails.helpers({
  shippingTo: function () {
    return this.shipping[0].address.fullName;
  },
  shippingAddress1: function () {
    if (this.shipping[0].address2) {
      return this.shipping[0].address.address1 + ' ' + this.shipping[0].address2;
    }
    return this.shipping[0].address.address1;
  },
  shippingAddress2: function () {
    return this.shipping[0].address.address2;
  },
  city: function () {
    return this.shipping[0].address.city;
  },
  state: function () {
    return this.shipping[0].address.region;
  },
  zipcode: function () {
    return this.shipping[0].address.postal;
  },
  items: function () {
    return this.advancedFulfillment.items;
  }
});
