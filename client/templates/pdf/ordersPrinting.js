import { Template } from 'meteor/templating';
import { Reaction } from '/client/api';
import { Orders } from '/lib/collections';
import { Blaze } from 'meteor/blaze';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import AdvancedFulfillment from '../../../lib/api';
import { _ } from 'meteor/underscore';
import moment from 'moment';

import './ordersPrinting.html';

Template.advancedFulfillmentOrdersPrint.onCreated(function () {
  Blaze._allowJavascriptUrls();
  let date = Reaction.Router.getParam('date');
  if (date) {
    this.subscribe('ordersShippingOnDate', date);
  } else {
    this.subscribe('selectedOrders', JSON.parse(localStorage.getItem('selectedOrdersToPrint')));
  }
});

Template.advancedFulfillmentOrdersPrint.onRendered(function () {
  BlazeLayout.render("advancedFulfillmentOrdersPrint");
});

Template.advancedFulfillmentOrdersPrint.helpers({
  humanReadableDate: function (day) {
    // let date = this.advancedFulfillment.shipmentDate;
    return moment(day).format('MMMM Do, YYYY');
  },
  shippingAddress: function (order) {
    if (!order.shipping) { // TODO: Build default message for missing shipping address
      return {};
    }
    return order.shipping[0].address;
  },
  billingAddress: function (order) {
    // TODO: Build default message for missing billing address
    if (!order.billing) {
      return {};
    }
    return order.billing[0].address;
  },
  itemAttr: function (attr) {
    item = _.findWhere(Template.parentData().items, {_id: this._id});
    if (!item) {
      return false;
    }
    return item.variants[attr];
  },
  orders: function () {
    let day = Reaction.Router.getParam('date');
    if (day) {
      let startOfDay = moment(day, 'MM-DD-YYYY').startOf('day').toDate();
      let endOfDay = moment(day, 'MM-DD-YYYY').endOf('day').toDate();
      return Orders.find({
        'advancedFulfillment.workflow.status': {
          $in: AdvancedFulfillment.orderActive
        },
        'advancedFulfillment.shipmentDate': {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }, {
        sort: {
          shopifyOrderNumber: 1
        }
      });
    }
    const selectedOrders = JSON.parse(localStorage.selectedOrdersToPrint || '[]');
    return Orders.find({
      '_id': {
        $in: selectedOrders
      },
      'advancedFulfillment.workflow.status': {
        $in: AdvancedFulfillment.orderActive
      }
    });
  }
});
