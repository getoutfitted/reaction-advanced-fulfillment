import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Reaction } from '/client/api';
import { Orders } from '/lib/collections';

import './missingDamaged.html';

Template.missingDamaged.onCreated(function () {
  this.autorun(() => {
    Reaction.Router.watchPathChange();
    this.subscribe('ordersWithMissing/DamagedItems');
  });
});

Template.missingDamaged.helpers({
  orders: function () {
    let thisRoute = Reaction.Router.getRouteName();
    if (thisRoute === 'damaged') {
      return Orders.find({
        'advancedFulfillment.items.workflow.status': 'damaged'
      }, {
        sort: {
          orderNumber: 1
        }
      });
    } else if (thisRoute === 'missing') {
      return Orders.find({
        'advancedFulfillment.items.workflow.status': 'missing'
      }, {
        sort: {
          orderNumber: 1
        }
      });
    }
  },
  typeOf: function () {
    let thisRoute = Reaction.Router.getRouteName();
    if (thisRoute === 'damaged') {
      return 'Damaged';
    } else if (thisRoute === 'missing') {
      return 'Missing';
    }
  }
});

Template.missingDamagedOrder.helpers({
  missingDamagedItems: function () {
    let items = this.advancedFulfillment.items;
    let thisRoute = Reaction.Router.getRouteName();
    if (thisRoute === 'damaged') {
      return  _.filter(items, function (item) {
        return item.workflow.status === 'damaged';
      });
    }
    return  _.filter(items, function (item) {
      return item.workflow.status === 'missing';
    });
  },
  daysOverDue: function () {
    let dueDate = this.advancedFulfillment.returnDate;
    return moment(dueDate).fromNow();
  },
  userName: function () {
    return this.billing[0].address.fullName;
  },
  userPhone: function () {
    return this.billing[0].address.phone;
  }
});

Template.missingDamagedItem.helpers({
  missing: function () {
    let missing = Reaction.Router.getRouteName();
    if (missing === 'missing') {
      return true;
    }
    return false;
  }
});

Template.missingDamagedItem.events({
  'click .returned-button': function (event) {
    event.preventDefault();
    let orderId = event.target.dataset.orderId;
    let itemDescription = event.target.dataset.itemDescription;
    let itemId = this._id;
    let userId = Meteor.userId();
    let confirmed = confirm(itemDescription + ' was returned for order # ' + orderId + '?');
    if (confirmed) {
      Meteor.call('advancedFulfillment/itemResolved', orderId, itemId, 'returned', function (err, result) {
        if (result) {
          Meteor.call('advancedFulfillment/orderCompletionVerifier', result, userId);
        }
      });
    }
  },
  'click .repaired-button': function (event) {
    event.preventDefault();
    let orderId = event.target.dataset.orderId;
    let itemDescription = event.target.dataset.itemDescription;
    let itemId = this._id;
    let userId = Meteor.userId();
    let confirmed = confirm(itemDescription + ' was repaired/resoved for order # ' + orderId + '?');
    if (confirmed) {
      Meteor.call('advancedFulfillment/itemResolved', orderId, itemId, 'repaired', function (err, result) {
        if (result) {
          Meteor.call('advancedFulfillment/orderCompletionVerifier', result, userId);
        }
      });
    }
  }
});
