import { Template } from 'meteor/templating';
import { Reaction } from '/client/api';
import { Orders } from '/lib/collections';
import { Blaze } from 'meteor/blaze';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import moment from 'moment';
import './advancedFulfillment.html';

Template.advancedFulfillmentPDF.onCreated(function () {
  Blaze._allowJavascriptUrls();
  const orderId = Reaction.Router.getParam('_id');
  this.subscribe('advancedFulfillmentOrder', orderId);
});

Template.advancedFulfillmentPDF.onRendered(function () {
  BlazeLayout.render('advancedFulfillmentPDF');
});

Template.advancedFulfillmentPDF.helpers({
  order: function () {
    const orderId = Reaction.Router.getParam('_id');
    return Orders.findOne({
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

// Template.barcode.onRendered(function () {
//   $('.admin-controls-menu').remove();
//   let orderId = ReactionRouter.getParam('_id');
//   $('#barcode').barcode(orderId, 'code128', {
//     barWidth: 2,
//     barHeight: 100,
//     moduleSize: 15,
//     showHRI: true,
//     fontSize: 14
//   });
// });
