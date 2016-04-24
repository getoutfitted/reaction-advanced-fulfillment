Template.advancedFulfillmentPDF.onCreated(function () {
  Blaze._allowJavascriptUrls();
  const orderId = ReactionRouter.getParam('_id');
  this.subscribe('advancedFulfillmentOrder', orderId);
});

Template.advancedFulfillmentPDF.onRendered(function () {
  BlazeLayout.render('advancedFulfillmentPDF');
});

Template.advancedFulfillmentPDF.helpers({
  order: function () {
    const orderId = ReactionRouter.getParam('_id');
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
  $('.admin-controls-menu').remove();
  let orderId = ReactionRouter.getParam('_id');
  $('#barcode').barcode(orderId, 'code128', {
    barWidth: 2,
    barHeight: 100,
    moduleSize: 15,
    showHRI: true,
    fontSize: 14
  });
});
