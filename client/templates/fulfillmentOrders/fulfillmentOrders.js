Template.fulfillmentOrders.helpers({
  routeStatus: function () {
    let fullRoute = Router.current().url;
    let routeComponents = fullRoute.split('/');
    // let thisRoute = fullRoute.substr(32, 7);
    // if (thisRoute === 'shipping') {
    if (_.contains(routeComponents, 'shipping')) {
      return 'Orders Waiting to Be Shipped';
    } else if (_.contains(routeComponents, 'returns')) {
      return 'Orders Waiting to Be Returned';
    } else if (_.contains(routeComponents, 'local-deliveries')) {
      return 'All Local Deliveries';
    } else if (_.contains(routeComponents, 'local-delivery')) {
      return 'Local Deliveries for ' + Router.current().params.date;
    } else if (Router.current().params.status) {
      return 'Orders in ' + Router.current().params.status + ' status';
    }
  },
  showPrintOrdersLink: function () {
    let currentRoute = Router.current().route.getName();
    if (currentRoute === 'dateShipping') {
      return true;
    }
    return false;
  },
  shippingDate: function () {
    return Router.current().params.date;
  }
});

Template.fulfillmentOrders.events({
  'click #checkboxAllOrders': function (event) {
    const checked = event.currentTarget.checked;
    let selectedOrders = [];
    $('input[type=checkbox]').prop('checked', checked);

    $('input[type=checkbox]:checked').each(function () {
      selectedOrders.push($(this).data('id'));
    });

    Session.set('selectedOrders', selectedOrders);
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
    let longDate = this.advancedFulfillment.shipmentDate;
    return moment(longDate).format('MMMM Do, YYYY');
  },
  arrivalDay: function () {
    return moment(this.advancedFulfillment.arriveBy).format('MMMM Do, YYYY');
  },
  firstSkiDay: function () {
    return moment(this.startTime).format('MMMM Do, YYYY');
  },
  returningDate: function () {
    let longDate = this.advancedFulfillment.returnDate;
    return moment(longDate).format('MMMM Do, YYYY');
  },
  shippingState: function () {
    return this.shipping[0].address.region;
  },
  orderSelected: function () {
    Session.setDefault('selectedOrders', []);
    return Session.get('selectedOrders').indexOf(this._id) !== -1;
  },
  toBeShipped: function () {
    let fullRoute = Router.current().url;
    let routeComponents = fullRoute.split('/');
    let toBeShipped = _.intersection(routeComponents, ['shipping', 'local-delivery', 'local-deliveries']);
    let params = Router.current().params.status;
    let active = _.contains(AdvancedFulfillment.orderActive, params);
    if (toBeShipped.length > 0 || active) {
      return true;
    }
    return false;
  },
  status: function () {
    return this.advancedFulfillment.workflow.status;
  },
  contactInfo: function () {
    return this.email || 'Checked Out As Guest';
  },
  names: function () {
    return  {
      shipping: this.shipping[0].address.fullName,
      billing: this.shipping[0].address.fullName
    };
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
    Router.go('orderDetails', {_id: $(event.currentTarget).data('id')});
  },
  'click .advanceOrder': function (event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    let currentStatus = event.target.dataset.status;
    let orderId = this._id;
    let userId = Meteor.userId();
    Meteor.call('advancedFulfillment/updateOrderWorkflow', orderId, userId, currentStatus);
    Router.go('orderDetails', {_id: orderId});
  },
  'click .selfAssignOrder': function (event) {
    event.preventDefault();
    let currentStatus = event.target.dataset.status;
    let orderId = this._id;
    let userId = Meteor.userId();
    Meteor.call('advancedFulfillment/updateOrderWorkflow', orderId, userId, currentStatus);
  },
  'click input[type=checkbox]': function (event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    const checked = event.currentTarget.checked;
    const _id = $(event.currentTarget).data('id');

    let selectedOrders = Session.get('selectedOrders') || [];
    if (checked) {
      selectedOrders.push(_id);
    } else {
      selectedOrders = _.without(selectedOrders, _id);
    }

    Session.set('selectedOrders', selectedOrders);
  }
});
