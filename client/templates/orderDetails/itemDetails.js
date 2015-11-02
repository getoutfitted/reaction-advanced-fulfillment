function verified(item) {
  let input = Session.get(item._id);
  delete Session.keys[item._id];
  if (!item.sku) {
    item.sku = null;
  }
  if (input === item.variantId || input === item.sku) {
    return true;
  }
  return false;
}

Template.itemDetails.helpers({
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
      orderFulfilled: 'packed',
      orderShipping: 'shipped'
    };
    let result = true;
    if (thisItem.workflow.status === statusKey[status]) {
      result = false;
    }
    if (thisItem.workflow.status === 'picked') {
      result = verified(item);
    }
    return result;
    // return true;
  },
  nextItemStatus: function (currentStatus) {
    let status = {
      'In Stock': 'Pick Item',
      'picked': 'Pack Item',
      'packed': 'Item Fulfilled',
      'shipped': 'Item Returned'
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
      orderPacking: 'packed',
      orderReturning: 'checkedIn'
    };
    let items = this.advancedFulfillment.items;
    let allItemStatus = _.every(items, function (item) {
      return item.workflow.status === statusKey[status];
    });

    let result = _.some(history, function (hist) {
      return hist.event === status && hist.userId === userId && !allItemStatus;
    });
    return result;
  },
  uidVerificationEnabled: function (item) {
    let history = this.history;
    let itemStatus = item.workflow.status;
    let userId = Meteor.userId();
    let packingHistory = _.findWhere(history, {event: 'orderPacking'});
    let correctUser = false;
    if (packingHistory) {
      correctUser = packingHistory.userId === userId;
    }
    let correctItemStatus = itemStatus === 'picked';
    if (correctItemStatus && correctUser && packingHistory) {
      return true;
    }
    return false;
  },
  uidVerified: function (item) {
    if (verified(item)) {
      return item.workflow.status;
    } else if (item.workflow.status === 'picked' && this.advancedFulfillment.workflow.status === 'orderPacking') {
      return 'Verify SKU or Variant';
    }
    return item.workflow.status;
  },
  returningItems: function (item) {
    let returning = this.advancedFulfillment.workflow.status === 'orderReturning';
    let status = item.workflow.status === 'shipped';
    let history = this.history;
    let thisHistory = _.findWhere(history, {event: 'orderReturning'});
    let validUser = false;
    if  (thisHistory) {
      validUser = Meteor.userId() === thisHistory.userId;
    }
    if (returning && status && validUser) {
      return true;
    }
    return false;
  },
  SKU: function (item) {
    if (item.sku) {
      return item.sku;
    }
    return 'No SKU';
  },
  location: function (item) {
    if (item.location) {
      return item.location;
    }
    return 'No Location';
  }
});

Template.itemDetails.events({
  'click .item-picked': function (event) {
    event.preventDefault();

    let itemId = event.target.dataset.itemId;
    let orderId = this._id;
    let itemStatus = event.target.dataset.itemStatus;
    Meteor.call('advancedFulfillment/updateItemWorkflow', orderId, itemId, itemStatus);
  },
  'keyup .verify': function (event) {
    event.preventDefault();
    let itemId = event.target.dataset.itemId;
    let text = event.target.value;
    Session.set(itemId, text);
  },
  'click .missing-button': function (event) {
    event.preventDefault();
    let itemId = event.target.dataset.itemId;
    let itemDescription = event.target.dataset.itemDescription;
    let orderId = this._id;
    let confirmed = confirm('Please confirm ' + itemDescription + ' is missing from Order # ' + orderId);
    if (confirmed) {
      Meteor.call('advancedFulfillment/itemMissing', orderId, itemId);
    }
  }
});
