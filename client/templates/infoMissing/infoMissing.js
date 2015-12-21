Template.infoMissing.helpers({
  orderIssues: function () {
    let orderIssues = ReactionCore.Collections.Orders.find({
      $or: [
        {infoMissing: true},
        {itemMissingDetails: true},
        {bundleMissingColor: true},
        {'advancedFulfillment.impossibleShipDate': true}
      ]
    }).count();
    anyIssues = orderIssues > 0;
    return {
      count: orderIssues,
      any: anyIssues
    };
  },
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
  anyMissingRentalDates: function () {
    let ordersCount = ReactionCore.Collections.Orders.find({
      infoMissing: true,
      $or: [{
        startTime: {$exists: false}
      }, {
        endTime: {$exists: false}
      }, {
        rentalDays: {$exists: false}
      }]
    }).count();
    return ordersCount > 0;
  },
  anyMissingItemsFromOrder: function () {
    let ordersCount =  ReactionCore.Collections.Orders.find({
      itemMissingDetails: true
    }).count();
    return ordersCount > 0;
  },
  missingItemsFromOrder: function () {
    return ReactionCore.Collections.Orders.find({
      itemMissingDetails: true
    });
  },
  missingBundleInfo: function () {
    return ReactionCore.Collections.Orders.find({
      bundleMissingColor: true
    });
  },
  anyMissingBundleInfo: function () {
    let ordersCount = ReactionCore.Collections.Orders.find({
      bundleMissingColor: true
    }).count();
    return ordersCount > 0;
  },
  anyImpossibleDates: function () {
    let ordersCount = ReactionCore.Collections.Orders.find({
      'advancedFulfillment.impossibleShipDate': true
    }).count();
    return ordersCount > 0;
  },
  impossibleDates: function () {
    return ReactionCore.Collections.Orders.find({
      'advancedFulfillment.impossibleShipDate': true
    });
  }
});

Template.infoMissing.events({
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
    Meteor.call('advancedFulfillment/cancelOrder', orderId);
  }
});

Template.infoMissing.onRendered(function () {
  $('.picker .input-daterange').datepicker({
    startDate: 'today',
    todayBtn: 'linked',
    clearBtn: true,
    calendarWeeks: true,
    autoclose: true,
    todayHighlight: true
  });
});

// Template.csDetails.helpers({
//   billingName: function (order) {
//     return order.billing[0].address.fullName;
//   },
//   billingPhone: function (order) {
//     return order.billing[0].address.phone;
//   },
//   email: function (order) {
//     return order.email;
//   },
//   shippingName: function (order) {
//     return order.shipping[0].address.fullName;
//   },
//   shippingPhone: function (order) {
//     return order.shipping[0].address.phone;
//   },
//   shippingAddress: function (order) {
//     let address = order.shipping[0].address;
//     return '<p>' + address.fullName + '</p><p>' + address.address1 + ' ' + address.address2 + '</p><p>' + address.city + ', ' + address.region + ', ' + address.postal + '</p>';
//   }
// });
