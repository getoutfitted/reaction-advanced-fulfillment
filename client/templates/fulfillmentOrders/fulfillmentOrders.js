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
    return this.items.length;
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
  readyForAssignment: function () {
    let status = this.advancedFulfillment.workflow.status;
    let itemsArray = this.advancedFulfillment.items;
    let itemsPicked = _.every(itemsArray, function (item) {
      return item.workflow.status === 'picked';
    });
    let itemsPacked = _.every(itemsArray, function (item) {
      return item.workflow.status === 'packed';
    });
    let itemsShipped = _.every(itemsArray, function (item) {
      return item.workflow.status === 'shipped';
    });

    let itemsReturned = _.every(itemsArray, function (item) {
      return item.workflow.status === 'returned' || item.workflow.status === 'missing';
    });

    let result = false;
    switch (status) {
    case 'orderCreated':
      result = true;
      break;
    case 'orderPicking':
      result = itemsPicked;
      break;
    case 'orderPacking':
      result = itemsPacked;
      break;
    case 'orderShipping':
      result = itemsShipped;
      break;
    case 'orderReturning':
      result = itemsReturned;
      break;
    default:
      result = false;
    }
    return result;
  },
  nextStatus: function () {
    let currentStatus = this.advancedFulfillment.workflow.status;
    let options = [
      'orderCreated',
      'orderPicking',
      'orderPacking',
      'orderFulfilled',
      'orderShipping',
      'orderReturning',
      'orderInspecting'];
    let indexOfStatus = _.indexOf(options, currentStatus);
    return options[indexOfStatus + 1];
  },
  currentlyAssignedUser: function () {
    let currentStatus = this.advancedFulfillment.workflow.status;
    let history = _.findWhere(this.history, {event: currentStatus});
    if (history) {
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
    return history.userId === Meteor.userId();
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
