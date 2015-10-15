Template.pickerSlip.helpers({
  shippingTo: function () {
    return this.shipping[0].address.fullName;
  },
  shippingAddress: function () {
    if (this.shipping[0].address2) {
      return this.shipping[0].address.address1 + ' ' + this.shipping[0].address2;
    }
    return this.shipping[0].address.address1;
  }

});
