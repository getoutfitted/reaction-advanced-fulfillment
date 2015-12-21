Template.impossibleDates.helpers({
  impossibleDates: function () {
    return ReactionCore.Collections.Orders.find({
      'advancedFulfillment.impossibleShipDate': true
    });
  }
});

Template.impossibleDates.onRendered(function () {
  $('.picker .input-daterange').datepicker({
    startDate: 'today',
    todayBtn: 'linked',
    clearBtn: true,
    calendarWeeks: true,
    autoclose: true,
    todayHighlight: true
  });
});

Template.impossibleDates.events({
  'click .update-rental-dates': function (event) {
    event.preventDefault();
    let orderId = this._id;
    let startDate = new Date($('#' + orderId + ' [name="start"]').val());
    let endDate = new Date($('#' + orderId + ' [name="end"]').val());
    Meteor.call('advancedFulfillment/updateRentalDates', orderId, startDate, endDate);
  },
  'click .cancel-order': function (event) {
    event.preventDefault();
    let orderId = this._id;
    let userId = Meteor.userId();
    Meteor.call('advancedFulfillment/cancelOrder', orderId, userId);
  }
});
