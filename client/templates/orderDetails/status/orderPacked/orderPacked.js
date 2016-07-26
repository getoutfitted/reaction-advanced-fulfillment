import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import _ from 'underscore';
import AdvancedFulfillment from '../../../../../lib/api';
import './orderPacked.html';

Template.orderPacked.helpers({
  shippingInfo: function () {
    let shippingInfo = this.shipping[0].address;
    let afShipping = {};
    afShipping.fullName = shippingInfo.fullName;
    afShipping.address1 = shippingInfo.address1;
    afShipping.address2 = shippingInfo.address2;
    afShipping.city = shippingInfo.city;
    afShipping.state = shippingInfo.region;
    afShipping.zipcode = shippingInfo.postal;
    afShipping.phone = shippingInfo.phone;
    return afShipping;
  },
  localDelivery: function () {
    let shipping = this.shipping[0];
    let zipcode = shipping.address.postal;
    return _.contains(AdvancedFulfillment.localDeliveryZipcodes, zipcode);
  }
});

Template.orderPacked.events({
  'click .local-delivery': function (event) {
    const order = this;
    const currentItemStatus = 'packed';
    const status = this.advancedFulfillment.workflow.status;
    const userId = Meteor.userId();
    Meteor.call('advancedFulfillment/updateAllItems', order, currentItemStatus);
    Meteor.call('advancedFulfillment/updateOrderWorkflow', order._id, userId, status);
  },
  'click #labelPrint': function (event) {
    const order = this;
    const currentItemStatus = 'packed';
    const status = this.advancedFulfillment.workflow.status;
    const userId = Meteor.userId();
    Meteor.call('advancedFulfillment/updateAllItems', order, currentItemStatus);
    Meteor.call('advancedFulfillment/updateOrderWorkflow', order._id, userId, status);
  }
});
