import { Template } from 'meteor/templating';
import { Orders } from '/lib/collections';
import { Reaction } from '/client/api';
import moment from 'moment';
import $ from 'jquery';

import './afNavbar.html';

Template.afNavbar.onCreated(function () {
  this.subscribe('searchOrders');
});

Template.afNavbar.onRendered(function () {
  $('.navbar-primary-tags').hide();
  $('.admin-controls-menu').hide();
});

Template.afNavbar.helpers({
  todaysDate: function () {
    return moment().format('MM-DD-YYYY');
  },
  tomorrowsDate: function () {
    return moment().add(1, 'days').format('MM-DD-YYYY');
  },
  yesterdaysDate: function () {
    return moment().subtract(1, 'days').format('MM-DD-YYYY');
  }
});

Template.afNavbar.events({
  'submit .subnav-search-form, submit .navbar-search-form': function (event) {
    event.preventDefault();
    let searchValue = event.target.orderNumber.value;
    let order = Orders.findOne({
      $or : [
        { _id: searchValue},
        { orderNumber: parseInt(searchValue, 10)}
      ]
    });
    if (order) {
      Reaction.Router.go('orderDetails', {_id: order._id});
      event.target.orderNumber.value = '';
    } else {
      Alerts.removeSeen();
      Alerts.add(searchValue + ' is not a valid order number or order id, please try your search again.', 'danger', {
        autoHide: true
      });
    }
  },
  'click #afShipButton': function (event) {
    event.preventDefault();
    let unfilteredDate = $('#afShipInput').val();
    let verifiedDate = moment(unfilteredDate, 'MM-DD-YYYY').isValid();
    if (verifiedDate) {
      let date = moment(unfilteredDate, 'MM-DD-YYYY').format('MM-DD-YYYY');
      Reaction.Router.go('dateShipping', {date: date});
    }
  },
  'click #afLocalDeliveryButton': function (event) {
    event.preventDefault();
    let unfilteredDate = $('#afLocalDeliveryInput').val();
    let verifiedDate = moment(unfilteredDate, 'MM-DD-YYYY').isValid();
    if (verifiedDate) {
      let date = moment(unfilteredDate, 'MM-DD-YYYY').format('MM-DD-YYYY');
      Reaction.Router.go('dateLocalDelivery', {date: date});
    }
  },
  'click #afReturnButton': function (event) {
    event.preventDefault();
    let unfilteredDate = $('#afReturnInput').val();
    let verifiedDate = moment(unfilteredDate, 'MM-DD-YYYY').isValid();
    if (verifiedDate) {
      let date = moment(unfilteredDate, 'MM-DD-YYYY').format('MM-DD-YYYY');
      Reaction.Router.go('dateReturning', {date: date});
    }
  }
});
