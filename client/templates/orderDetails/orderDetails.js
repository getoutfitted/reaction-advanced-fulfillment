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
    let options = ['orderCreated', 'orderPicking', 'orderPacking', 'orderFulfilled'];
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
    default:
      result = false;
      break;
    }
    return result;
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
    let currentStatus = event.target.dataset.status;
    let orderId = this._id;
    let userId = Meteor.userId();
    Meteor.call('advancedFulfillment/updateOrderWorkflow', orderId, userId, currentStatus);
  }
});

Template.itemDetails.helpers({
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
  items: function () {
    return this.advancedFulfillment.items;
  },
  orderId: function () {
    return this._id;
  },
  itemUpdateable: function (item) {
    let itemId = item._id;
    let status = this.advancedFulfillment.workflow.status;
    let items = this.advancedFulfillment.items;
    let thisItem = _.findWhere(items, {_id: itemId});
    let statusKey = {
      orderCreated: 'In Stock',
      orderPicking: 'picked',
      orderPacking: 'packed',
      orderCompleted: 'itemFulfilled'
    };
    if (thisItem.workflow.status === statusKey[status]) {
      return false;
    }
    return true;
  },
  nextItemStatus: function (currentStatus) {
    let status = {
      'In Stock': 'Pick Item',
      'picked': 'Pack Item',
      'packed': 'Item Fulfilled',
      'completed': 'Item Fulfilled'
    };
    return status[currentStatus];
  },
  allowedToUpdateItem: function () {
    let status = this.advancedFulfillment.workflow.status;
    let history = this.history;
    let userId = Meteor.userId();
    let statusKey = {
      orderCompleted: 'In Stock',
      orderPicking: 'picked',
      orderPacking: 'packed'
    };
    let items = this.advancedFulfillment.items;
    let allItemStatus = _.every(items, function (item) {
      return item.workflow.status === statusKey[status];
    });

    let result = _.some(history, function (hist) {
      return (hist.event === status) && (hist.userId === userId) && !allItemStatus;
    });
    return result;
  }
});

Template.itemDetails.events({
  'click .item-picked': function (event) {
    event.preventDefault();

    let itemId = event.target.dataset.itemId;
    let orderId = this._id;
    let itemStatus = event.target.dataset.itemStatus;
    Meteor.call('advancedFulfillment/updateItemWorkflow', orderId, itemId, itemStatus);
  }
});

