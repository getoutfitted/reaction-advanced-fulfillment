import { Template } from 'meteor/templating';
import { Reaction } from '/client/api';
import { Orders } from '/lib/collections';
import { Blaze } from 'meteor/blaze';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import AdvancedFulfillment from '../../../lib/api';
import { _ } from 'meteor/underscore';
import moment from 'moment';
import './localDeliveryLabel.html';

Template.localDeliveryLabelPDF.onCreated(function () {
  Blaze._allowJavascriptUrls();
  const orderId = Reaction.Router.getParam('_id');
  this.subscribe('advancedFulfillmentOrder', orderId);
});

Template.localDeliveryLabelPDF.onRendered(function () {
  BlazeLayout.render("localDeliveryLabelPDF");
});

Template.localDeliveryLabelPDF.helpers({
  order: function () {
    const orderId = Reaction.Router.getParam('_id');
    return Orders.findOne({
      _id: orderId
    });
  },
  hasNoRentals: function () {
    return _.every(this.items, function (item) {
      return item.variants.functionalType === 'variant';
    });
  },
  displayOrderNumber: function () {
    return this.orderNumber || this.shopifyOrderNumber || this._id;
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
