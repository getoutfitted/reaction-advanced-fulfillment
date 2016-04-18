Template.csDetails.helpers({
  billingName: function () {
    return this.billing[0].address.fullName;
  },
  billingPhone: function () {
    return this.billing[0].address.phone;
  },
  shippingName: function () {
    return this.shipping[0].address.fullName;
  },
  shippingPhone: function () {
    return this.shipping[0].address.phone;
  },
  shippingAddress: function () {
    let address = this.shipping[0].address;
    return address.address1 + ' ' + address.address2 + ' ' + address.city + ', ' + address.region + ' ' + address.postal;
  }
});
