function fullDay(rawDate) {
  check(rawDate, String);
  let dayStart = moment(rawDate, 'MM-DD-YYYY').startOf('day').toDate();
  let dayEnd = moment(rawDate, 'MM-DD-YYYY').endOf('day').toDate();
  return {
    dayStart: dayStart,
    dayEnd: dayEnd
  };
}
Template.returnOrders.onCreated(function () {
  this.autorun(() => {
    let date = ReactionRouter.getParam('date');
    if (date) {
      this.subscribe('ordersReturningOnDate', date);
    } else {
      this.subscribe('afReturnOrders');
    }
  });
  Session.setDefault('returnOrders', []);
});

Template.returnOrders.helpers({
  orders: function () {
    let params = ReactionRouter.getParam('date');
    if (params) {
      let dayTime = fullDay(params);
      return ReactionCore.Collections.Orders.find({
        'advancedFulfillment.workflow.status': {
          $in: AdvancedFulfillment.orderReturning
        },
        'advancedFulfillment.returnDate': {
          $gte: dayTime.dayStart,
          $lte: dayTime.dayEnd
        }
      }, {
        sort: {
          shopifyOrderNumber: 1
        }
      });
    }
    return ReactionCore.Collections.Orders.find({
      'advancedFulfillment.workflow.status': {
        $in: AdvancedFulfillment.orderReturning
      }
    }, {
      sort: {
        'advancedFulfillment.returnDate': 1,
        'shopifyOrderNumber': 1
      }
    });
  },
  ordersSelected: function () {
    return Session.get('returnOrders').length;
  },
  ordersAreSelected: function () {
    return Session.get('returnOrders').length > 0;
  }
});

Template.returnOrders.events({
  'click #checkboxAllOrders': function () {
    const checked = Session.get('returnOrders').length > 0;
    let returnOrders = [];
    $('input[type=checkbox]').prop('checked', !checked);

    $('input[type=checkbox]:checked').each(function () {
      returnOrders.push($(this).data('id'));
    });
    Session.set('returnOrders', returnOrders);
  },
  'change #bulkActions': function (event) {
    if (event.currentTarget.value === 'return') {
      Meteor.call('advancedFulfillment/returnSelectedOrders', Session.get('returnOrders'));
    } else if (event.currentTarget.value === 'complete') {
      Meteor.call('advancedFulfillment/completeSelectedOrders', Session.get('returnOrders'));
    }
    Session.set('returnOrders', []);
  }
});

Template.returnOrder.helpers({
  orderNumber: function  () {
    if (this.shopifyOrderNumber) {
      return '#' + this.shopifyOrderNumber + ' ';
    }
    return '';
  },
  orderSelected: function () {
    return Session.get('returnOrders').indexOf(this._id) !== -1;
  },
  returningDate: function () {
    return moment(this.advancedFulfillment.returnDate).calendar(null, AdvancedFulfillment.calendarReferenceTime);
  },
  shippingDay: function () {
    return moment(this.advancedFulfillment.shipReturnBy).calendar(null, AdvancedFulfillment.calendarReferenceTime);
  },
  lastSkiDay: function () {
    return moment(this.endTime).calendar(null, AdvancedFulfillment.calendarReferenceTime);
  },
  returnName: function () {
    return this.shipping[0].address.fullName;
  },
  shippingLoc: function () {
    return this.shipping[0].address.city + ', ' + this.shipping[0].address.region;
  },
  status: function () {
    return AdvancedFulfillment.humanOrderStatuses[this.advancedFulfillment.workflow.status];
  }
});

Template.returnOrder.events({
  'click .orderRow': function (event) {
    ReactionRouter.go('orderDetails', {_id: $(event.currentTarget).data('id')});
  },
  'click label .fa-check-square-o, click label .fa-square-o': function (event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    const checked = $(event.currentTarget).parent().prev()[0].checked;
    $(event.currentTarget).parent().prev()[0].checked = !checked;
    const _id = $(event.currentTarget).parent().prev().data('id');
    let returnOrders = Session.get('returnOrders');
    if (!checked) {
      returnOrders.push(_id);
    } else {
      returnOrders = _.without(returnOrders, _id);
    }
    Session.set('returnOrders', returnOrders);
  }
});
