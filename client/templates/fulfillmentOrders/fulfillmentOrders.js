function fullDay(rawDate) {
  check(rawDate, String);
  let dayStart = moment(rawDate, 'MM-DD-YYYY').startOf('day').toDate();
  let dayEnd = moment(rawDate, 'MM-DD-YYYY').endOf('day').toDate();
  return {
    dayStart: dayStart,
    dayEnd: dayEnd
  };
}
function context(routeName) {
  check(routeName, String);
  let baseFilter = {
    'advancedFulfillment.workflow.status': {
      $in: AdvancedFulfillment.orderActive
    },
    'startTime': {$ne: undefined}
  };
  let baseSorting = {
    sort: {
      'advancedFulfillment.shipmentDate': 1,
      'advancedFulfillment.localDelivery': 1,
      'advancedFulfillment.rushDelivery': 1,
      'shopifyOrderNumber': 1
    }
  };
  const rawDate = ReactionRouter.current().params.date;
  let dayTime;
  switch (routeName) {
  case 'allLocalDeliveries':
    let allLocalFilter = _.extend(baseFilter, {
      'advancedFulfillment.localDelivery': true
    });
    return {
      subscription: 'afOrders',
      filters: allLocalFilter,
      sortingOrder: baseSorting
    };
  case 'orderByStatus':
    let status = ReactionRouter.current().params.status;
    let byStatusFilter = _.extend(baseFilter, {
      'advancedFulfillment.workflow.status': status
    });
    return {
      subscription: 'ordersByStatus',
      filters: byStatusFilter,
      sortingOrder: baseSorting
    };
  case 'dateShipping':
    dayTime = fullDay(rawDate);
    let dateFilter = _.extend(baseFilter, {
      'advancedFulfillment.shipmentDate': {
        $gte: dayTime.dayStart,
        $lte: dayTime.dayEnd
      }
    });
    return {
      subscription: 'ordersShippingOnDate',
      filters: dateFilter,
      sortingOrder: baseSorting
    };
  case 'dateLocalDelivery':
    dayTime = fullDay(rawDate);
    let localDateFilter = _.extend(baseFilter, {
      'advancedFulfillment.localDelivery': true,
      'advancedFulfillment.shipmentDate': {
        $gte: dayTime.dayStart,
        $lte: dayTime.dayEnd
      }
    });
    return {
      subscription: 'ordersShippingOnDate',
      filters: localDateFilter,
      sortingOrder: baseSorting
    };
  default:
    return {
      subscription: 'shippingOrders',
      filters: baseFilter,
      sortingOrder: baseSorting
    };
  }
}

Template.fulfillmentOrders.onCreated(function () {
  let instance = this;
  instance.autorun(function () {
    let currentRoute = ReactionRouter.current().route.name;
    // let currentRoute = Router.current().route.getName();
    let result = context(currentRoute);
    let params = ReactionRouter.current().params.status || ReactionRouter.current().params.date;

    if (params) {
      instance.subscribe(result.subscription, params);
    } else {
      instance.subscribe(result.subscription);
    }
  });
  Session.setDefault('selectedOrders', []);
});

Template.fulfillmentOrders.helpers({
  orders: function () {
    const currentRoute = ReactionRouter.current().route.name;
    let result = context(currentRoute);
    return ReactionCore.Collections.Orders.find(
      result.filters,
      result.sortingOrder
    );
  },
  routeStatus: function () {
    let fullRoute = ReactionRouter.current().path;
    let routeComponents = fullRoute.split('/');
    if (_.contains(routeComponents, 'shipping')) {
      return 'Orders Waiting to Be Shipped';
    } else if (_.contains(routeComponents, 'returns')) {
      return 'Orders Waiting to Be Returned';
    } else if (_.contains(routeComponents, 'local-deliveries')) {
      return 'All Local Deliveries';
    } else if (_.contains(routeComponents, 'local-delivery')) {
      return 'Local Deliveries for ' + ReactionRouter.current().params.date;
    } else if (ReactionRouter.current().params.status) {
      return AdvancedFulfillment.humanOrderStatuses[ReactionRouter.current().params.status] + ' Orders';
    }
  },
  showPrintOrdersLink: function () {
    let currentRoute = ReactionRouter.current().route.name;
    if (currentRoute === 'dateShipping') {
      return true;
    }
    return false;
  },
  shippingDate: function () {
    return ReactionRouter.current().params.date;
  },
  ordersSelected: function () {
    return Session.get('selectedOrders').length;
  },
  ordersAreSelected: function () {
    return Session.get('selectedOrders').length > 0;
  },
  contextBulkActions: function (status) {
    if (status === 'orderShipped') {
      return '<option value="undoShipped">Mark ' + Session.get('selectedOrders').length + ' Orders as Labeled</option>';
    }
  }
});

Template.fulfillmentOrders.events({
  'click #checkboxAllOrders': function () {
    const checked = Session.get('selectedOrders').length > 0;
    let selectedOrders = [];
    $('input[type=checkbox]').prop('checked', !checked);

    $('input[type=checkbox]:checked').each(function () {
      selectedOrders.push($(this).data('id'));
    });

    Session.set('selectedOrders', selectedOrders);
  },
  'change #bulkActions': function (event) {
    if (event.currentTarget.value === 'print') {
      localStorage.selectedOrdersToPrint = JSON.stringify(Session.get('selectedOrders'));
      Meteor.call('advancedFulfillment/printSelectedOrders', Session.get('selectedOrders'));
      window.open(window.location.origin + ReactionRouter.path('orders.printSelected'));
    } else if (event.currentTarget.value === 'ship') {
      Meteor.call('advancedFulfillment/shipSelectedOrders', Session.get('selectedOrders'));
    } else if (event.currentTarget.value === 'undoShipped') {
      Meteor.call('advancedFulfillment/unshipSelectedOrders', Session.get('selectedOrders'));
    }
    // TODO: Alert user of success or failure
    Session.set('selectedOrders', []);
  }
});

Template.fulfillmentOrder.helpers({
  orderNumber: function  () {
    if (this.shopifyOrderNumber) {
      return '#' + this.shopifyOrderNumber + ' ';
    }
    return '';
  },
  shippingDate: function () {
    return moment(this.advancedFulfillment.shipmentDate).calendar(null, AdvancedFulfillment.shippingCalendarReference);
  },
  arrivalDay: function () {
    return moment(this.advancedFulfillment.arriveBy).calendar(null, AdvancedFulfillment.shippingCalendarReference);
  },
  firstSkiDay: function () {
    return moment(this.startTime).calendar(null, AdvancedFulfillment.shippingCalendarReference);
  },
  returningDate: function () {
    let longDate = this.advancedFulfillment.returnDate;
    return moment(longDate).format('MMMM Do, YYYY');
  },
  shippingLoc: function () {
    return this.shipping[0].address.city + ', ' + this.shipping[0].address.region;
  },
  orderSelected: function () {
    // Session.setDefault('selectedOrders', []);
    return Session.get('selectedOrders').indexOf(this._id) !== -1;
  },
  toBeShipped: function () {
    let fullRoute = ReactionRouter.current().path;
    let routeComponents = fullRoute.split('/');
    let toBeShipped = _.intersection(routeComponents, ['shipping', 'local-delivery', 'local-deliveries']);
    let params = ReactionRouter.current().params.status;
    let active = _.contains(AdvancedFulfillment.orderActive, params);
    if (toBeShipped.length > 0 || active) {
      return true;
    }
    return false;
  },
  status: function () {
    return AdvancedFulfillment.humanOrderStatuses[this.advancedFulfillment.workflow.status];
  },
  contactInfo: function () {
    return this.email || 'Checked Out As Guest';
  },
  shippingName: function () {
    return this.shipping[0].address.fullName;
  },
  phoneNumber: function () {
    return this.shipping[0].address.phone || '';
  },
  uniqueItemsCount: function () {
    return this.advancedFulfillment.items.length;
  },
  totalItemsCount: function () {
    let total = _.reduce(this.items, function (sum, item) {
      return sum + item.quantity;
    }, 0);
    return total;
  },
  orderId: function () {
    return this._id;
  },
  orderCreated: function () {
    let valid = this.advancedFulfillment.workflow.status === 'orderCreated';
    return valid;
  },
  readyForAssignment: function () {
    let status = this.advancedFulfillment.workflow.status;
    let updateableStatuses = AdvancedFulfillment.assignmentStatuses;
    return _.contains(updateableStatuses, status);
  },
  nextStatus: function () {
    let currentStatus = this.advancedFulfillment.workflow.status;
    let options = AdvancedFulfillment.workflow;
    let indexOfStatus = _.indexOf(options, currentStatus);
    return options[indexOfStatus + 1];
  },
  currentlyAssignedUser: function () {
    let currentStatus = this.advancedFulfillment.workflow.status;
    let history = _.findWhere(this.history, {event: currentStatus});
    let nonUpdateableStatuses = AdvancedFulfillment.nonAssignmentStatuses;
    let valid = _.contains(nonUpdateableStatuses, currentStatus);
    if (history && valid) {
      let assignedUser = history.userId;
      return Meteor.users.findOne(assignedUser).username;
    }
    return '';
  },
  currentlyAssignedTime: function () {
    let currentStatus = this.advancedFulfillment.workflow.status;
    let history = _.findWhere(this.history, {event: currentStatus});
    let assignedTime = history.updatedAt;
    return assignedTime;
  },
  isMyOrder: function () {
    let currentStatus = this.advancedFulfillment.workflow.status;
    let history = _.findWhere(this.history, {event: currentStatus});
    if (history) {
      return history.userId === Meteor.userId();
    }
    return false;
  }
});

Template.fulfillmentOrder.events({
  'click .orderRow': function (event) {
    ReactionRouter.go('orderDetails', {_id: $(event.currentTarget).data('id')});
  },
  'click .advanceOrder': function (event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    let currentStatus = event.target.dataset.status;
    let orderId = this._id;
    let userId = Meteor.userId();
    Meteor.call('advancedFulfillment/updateOrderWorkflow', orderId, userId, currentStatus);
    ReactionRouter.go('orderDetails', {_id: orderId});
  },
  'click .selfAssignOrder': function (event) {
    event.preventDefault();
    let currentStatus = event.target.dataset.status;
    let orderId = this._id;
    let userId = Meteor.userId();
    Meteor.call('advancedFulfillment/updateOrderWorkflow', orderId, userId, currentStatus);
  },
  'click label .fa-check-square-o, click label .fa-square-o': function (event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    const checked = $(event.currentTarget).parent().prev()[0].checked;
    $(event.currentTarget).parent().prev()[0].checked = !checked;
    const _id = $(event.currentTarget).parent().prev().data('id');
    let selectedOrders = Session.get('selectedOrders');

    if (!checked) {
      selectedOrders.push(_id);
    } else {
      selectedOrders = _.without(selectedOrders, _id);
    }

    Session.set('selectedOrders', selectedOrders);
  },
  'click .no-click': function (event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
  }
});
