Template.fulfillmentOrders.helpers({
  routeStatus: function () {
    let fullRoute = Iron.Location.get().path;
    let thisRoute = fullRoute.substr(32, 7);
    if (thisRoute === 'shippin') {
      return 'Shipped';
    } else if (thisRoute === 'returns') {
      return 'Returned';
    }
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
  returningDate: function () {
    let longDate = this.advancedFulfillment.returnDate;
    return moment(longDate).format('MMMM Do, YYYY');
  },
  toBeShipped: function () {
    let fullRoute = Iron.Location.get().path;
    let thisRoute = fullRoute.substr(32, 8);
    if (thisRoute === 'shipping') {
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
    let options = AdvancedFulfillment.workflow
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
  'click .advanceOrder': function (event) {
    event.preventDefault();
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
  }
});
