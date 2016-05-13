import $ from 'jquery';
import 'bootstrap-datepicker';

Template.missingRentalDates.onCreated(function () {
  this.subscribe('custServOrders');
});

Template.missingRentalDates.helpers({
  missingRentalDates: function () {
    return ReactionCore.Collections.Orders.find({
      infoMissing: true,
      $or: [{
        startTime: {$exists: false}
      }, {
        endTime: {$exists: false}
      }, {
        rentalDays: {$exists: false}
      }]
    }, {$sort: {createdAt: 1}});
  },
  billingName: function () {
    return this.billing[0].address.fullName;
  },
  billingPhone: function () {
    return this.billing[0].address.phone;
  },
  shippingAddress: function () {
    let address = this.shipping[0].address;
    return address.address1 + ' ' + address.city + ', ' + address.region + ' ' + address.postal;
  }
});

Template.datePicker.events({
  'click .update-rental-dates': function (event) {
    event.preventDefault();
    let orderId = this._id;
    let startDate = new Date($('#' + orderId + ' [name="start"]').val());
    let endDate = new Date($('#' + orderId + ' [name="end"]').val());
    let user = Meteor.user();
    Meteor.call('advancedFulfillment/updateRentalDates', orderId, startDate, endDate, user);
  }
});

Template.datePicker.onRendered(function () {
  $('.picker .input-daterange').datepicker({
    startDate: 'today',
    todayBtn: 'linked',
    clearBtn: true,
    calendarWeeks: true,
    autoclose: true,
    todayHighlight: true
  });
});
