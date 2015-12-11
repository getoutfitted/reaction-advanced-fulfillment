function getIndexBy(array, name, value) {
  for (let i = 0; i < array.length; i++) {
    if (array[i][name] === value) {
      return i;
    }
  }
}

Template.orderDetails.helpers({
  currentStatus: function () {
    let currentStatus = this.advancedFulfillment.workflow.status;
    let generalTemplates = [
      'orderCreated',
      'orderPrinted',
      'orderPicked',
      'orderShipped',
      'orderIncomplete',
      'orderCompleted'
    ];
    // let generalTemplates = AdvancedFulfillment.assignmentStatuses;
    let valid = _.contains(generalTemplates, currentStatus);
    if (valid) {
      return 'defaultStatus';
    };
    return currentStatus;
  },
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
  orderCreated: function () {
    let valid = this.advancedFulfillment.workflow.status === 'orderCreated';
    return valid;
  },
  nextStatus: function () {
    let currentStatus = this.advancedFulfillment.workflow.status;
    let options = AdvancedFulfillment.workflow;
    let indexOfStatus = _.indexOf(options, currentStatus);
    return options[indexOfStatus + 1];
  },
  readyForAssignment: function () {
    let status = this.advancedFulfillment.workflow.status;
    let updateableStatuses = AdvancedFulfillment.assignmentStatuses;
    return _.contains(updateableStatuses, status);
  },
  shopifyOrder: function () {
    if (this.shopifyOrderNumber) {
      return true;
    }
    return false;
  },
  displayOrderNumber: function () {
    if (this.shopifyOrderId) {
      return '<a href="http://getoutfitted.myshopify.com/admin/orders/'
      + this.shopifyOrderId
      + '">Order #' + this.shopifyOrderNumber + '</a>';
    } else if (this.shopifyOrderNumber) {
      return 'Order #' + this.shopifyOrderNumber;
    }

    // Default
    return 'Order #' + this._id;
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
  myOrdersInCurrentStep: function () {
    let currentStatus = this.advancedFulfillment.workflow.status;
    let history = _.findWhere(this.history, {event: currentStatus});
    if (!history) {
      return false;
    }
    // TODO: Maybe change to cursor?
    let orders = Orders.find({
      'history.userId': Meteor.userId(),
      'history.event': currentStatus,
      'advancedFulfillment.workflow.status': currentStatus
    }).fetch();
    let myOrder = history.userId === Meteor.userId();
    let myOrders = {};
    let currentOrder = getIndexBy(orders, '_id', this._id);
    let nextOrder = myOrder ? orders[currentOrder - 1] : undefined;
    let prevOrder = myOrder ? orders[currentOrder + 1] : undefined;
    myOrders.nextOrderId = nextOrder ? nextOrder._id : undefined;
    myOrders.hasNextOrder = nextOrder ? true : false;
    myOrders.hasPrevOrder = prevOrder ? true : false;
    myOrders.prevOrderId = prevOrder ? prevOrder._id : undefined;
    myOrders.count = orders.length;
    return myOrders;
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
  'blur .notes': function (event) {
    event.preventDefault();
    let notes = event.target.value;
    let orderId = this._id;
    Meteor.call('advancedFulfillment/updateOrderNotes', orderId, notes)
  }
});
