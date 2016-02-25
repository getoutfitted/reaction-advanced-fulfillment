Template.advancedFulfillmentPDF.onCreated(function () {
  Blaze._allowJavascriptUrls();
  const orderId = ReactionRouter.current().params._id;
  this.subscribe('advancedFulfillmentOrder', orderId);
});

Template.advancedFulfillmentPDF.helpers({
  order: function () {
    const orderId = ReactionRouter.current().params._id;
    return ReactionCore.Collections.Orders.findOne({
      _id: orderId
    });
  },
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

Template.barcode.onRendered(function () {
  let orderId = ReactionRouter.current().params._id;
  $('#barcode').barcode(orderId, 'code128', {
    barWidth: 2,
    barHeight: 100,
    moduleSize: 15,
    showHRI: true,
    fontSize: 14
  });
});
