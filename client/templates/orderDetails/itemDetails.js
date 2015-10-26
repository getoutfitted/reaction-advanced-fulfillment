function verified(itemId) {
  let input = Session.get(itemId);
  delete Session.keys[itemId];
  if (input === itemId) {
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
      orderCompleted: 'itemFulfilled'
    };
    let result = true;
    if (thisItem.workflow.status === statusKey[status]) {
      result = false;
    }
    if (thisItem.workflow.status === 'picked') {
      result = verified(itemId);
    }
    return result;
    // return true;
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
    if (verified(item._id)) {
      return item.workflow.status;
    }
    return 'Verify Item UID';
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
  }
});
