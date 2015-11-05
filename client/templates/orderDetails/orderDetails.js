Template.orderDetails.helpers({
  status: function () {
    return this.advancedFulfillment.workflow.status;
  },
  shippingDate: function () {
    let date = this.advancedFulfillment.shipmentDate;
    return moment(date).format('MMMM Do, YYYY');
  },
  returnDate: function () {
    let date = this.advancedFulfillment.returnDate;
    return moment(date).format('MMMM Do, YYYY');
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
      'orderInspecting'
    ];
    let indexOfStatus = _.indexOf(options, currentStatus);
    return options[indexOfStatus + 1];
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
      return item.workflow.status === 'returned' || item.workflow.status === 'missing'
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
      break;
    }
    return result;
  },
  shippingTo: function () {
    return this.shipping[0].address.fullName;
  },
  shippingAddress1: function () {
    if (this.shipping[0].address2) {
      return this.shipping[0].address.address1 + ' ' + this.shipping[0].address2;
    }
    return this.shipping[0].address.address1;
  },
  shippingAddress2: function () {
    return this.shipping[0].address.address2;
  },
  city: function () {
    return this.shipping[0].address.city;
  },
  state: function () {
    return this.shipping[0].address.region;
  },
  zipcode: function () {
    return this.shipping[0].address.postal;
  },
  contactInfo: function () {
    return this.email || 'Checked Out As Guest';
  },
  phoneNumber: function () {
    return this.shipping[0].address.phone || '';
  },
  printLabel: function () {
    let status = this.advancedFulfillment.workflow.status;
    if (status === 'orderFulfilled') {
      return true;
    }
    return false;
  },
  currentlyAssignedUser: function () {
    let currentStatus = this.advancedFulfillment.workflow.status;
    let history = _.findWhere(this.history, {event: currentStatus});
    let assignedUser = history.userId;
    return Meteor.users.findOne(assignedUser).username;
  },
  currentlyAssignedTime: function () {
    let currentStatus = this.advancedFulfillment.workflow.status;
    let history = _.findWhere(this.history, {event: currentStatus});
    let assignedTime = history.updatedAt;
    return assignedTime;
  },
  finalStatus: function () {
    let status = this.advancedFulfillment.workflow.status;
    let orderId = this._id;
    let validStatus = status === 'orderInspecting' || status === 'orderIncomplete';
    let userId = Meteor.userId();
    let items = this.advancedFulfillment.items;
    let allItemsInspected = _.every(items, function (item) {
      return item.workflow.status === 'inspected' || item.workflow.status === 'completed';
    });
    let allItemsFinalStatus = _.every(items, function (item) {
      return item.workflow.status === 'inspected' || item.workflow.status === 'missing' || item.workflow.status === 'damaged'
    });
    if (validStatus && allItemsInspected) {
      Meteor.call('advancedFulfillment/finalOrderStatus', 'orderCompleted', orderId, userId);
    } else if (validStatus && allItemsFinalStatus) {
      Meteor.call('advancedFulfillment/finalOrderStatus', 'orderIncomplete', orderId, userId);
    }
  }
});

Template.orderDetails.onRendered(function () {
  let orderId = Router.current().params._id;
  $('#barcode').barcode(orderId, 'code128', {
    barWidth: 2,
    barHeight: 150,
    moduleSize: 15,
    showHRI: true,
    fontSize: 14
  });
});

Template.orderDetails.events({
  'click .advanceOrder': function (event) {
    event.preventDefault();
    let currentStatus = this.advancedFulfillment.workflow.status;
    let orderId = this._id;
    let userId = Meteor.userId();
    Meteor.call('advancedFulfillment/updateOrderWorkflow', orderId, userId, currentStatus);
  },
  'click .print-invoice': function (event) {
    let orderId = this._id;
    let order = this;
    let userId = Meteor.userId();
    let currentStatus = this.advancedFulfillment.workflow.status;
    Meteor.call('advancedFulfillment/updateAllItemsToShipped', order);
    Meteor.call('advancedFulfillment/updateOrderWorkflow', orderId, userId, currentStatus);
  }
});
