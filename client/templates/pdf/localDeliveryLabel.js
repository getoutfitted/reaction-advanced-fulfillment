Template.localDeliveryLabelPDF.onCreated(function () {
  Blaze._allowJavascriptUrls();
  const orderId = ReactionRouter.getParam('_id');
  this.subscribe('advancedFulfillmentOrder', orderId);
});

Template.localDeliveryLabelPDF.onRendered(function () {
  $('.admin-controls-menu').hide();
  console.log("Rendering!");
  // BlazeLayout.render("localDeliveryLabelPDF");
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
