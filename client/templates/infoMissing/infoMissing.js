Template.infoMissing.helpers({
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
  billingName: function (order) {
    return order.billing[0].address.fullName;
  },
  billingPhone: function (order) {
    return order.billing[0].address.phone;
  },
  email: function (order) {
    return order.email;
  },
  shippingName: function (order) {
    return order.shipping[0].address.fullName;
  },
  shippingPhone: function (order) {
    return order.shipping[0].address.phone;
  },
});
