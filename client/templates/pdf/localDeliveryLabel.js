Template.localDeliveryLabelPDF.onCreated(function () {
  Blaze._allowJavascriptUrls();
  const orderId = ReactionRouter.getParam('_id');
  this.subscribe('advancedFulfillmentOrder', orderId);
});

Template.localDeliveryLabelPDF.helpers({
  order: function () {
    const orderId = ReactionRouter.getParam('_id');
    return ReactionCore.Collections.Orders.findOne({
      _id: orderId
    });
  },
  dateHelper: function (date) {
    return moment(date).format('dddd, MM/DD/YYYY');
  },
  shippingAddress: function () {
    return this.shipping[0].address;
  },
  billingPhone: function () {
    return this.billing[0].address.phone;
  },
  shippingPhone: function () {
    return this.shipping[0].address.phone;
  }
});
