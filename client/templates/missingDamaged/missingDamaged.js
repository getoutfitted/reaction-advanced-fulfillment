Template.missingDamaged.helpers({
  typeOf: function () {
    let thisRoute = Router.current().route.getName();
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
    let thisRoute = Router.current().route.getName();
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
    let missing = Router.current().route.getName();
    if (missing === 'missing') {
      return true;
    }
    return false;
  },
  value: function (productId, variantId) {
    return 12.99;
  //   let variants = Products.findOne(productId).variants;
  //   let thisVariant = _.findWhere(variants, {_id: variantId});
  //   let parent = thisVariant.parentId;
  //   let msrp = _.findWhere(variants, {_id: parent});
  }
});

Template.missingDamagedItem.events({
  'click .returned-button': function (event) {
    event.preventDefault();
    let orderId = event.target.dataset.orderId;
    let itemDescription = event.target.dataset.itemDescription;
    let itemId = this._id;
    let confirmed = confirm(itemDescription + ' was returned for order # ' + orderId + '?');
    if (confirmed) {
      Meteor.call('advancedFulfillment/itemReturned', orderId, itemId);
    }
  },
  'click .repaired-button': function (event) {
    event.preventDefault();
    let orderId = event.target.dataset.orderId;
    let itemDescription = event.target.dataset.itemDescription;
    let itemId = this._id;
    let confirmed = confirm(itemDescription + ' was repaired/resoved for order # ' + orderId + '?');
    if (confirmed) {
      Meteor.call('advancedFulfillment/itemRepaired', orderId, itemId);
    }
  }
});
