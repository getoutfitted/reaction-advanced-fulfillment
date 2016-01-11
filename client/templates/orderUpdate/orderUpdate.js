function findOrderItem(order, itemId) {
  return _.findWhere(order.items, {_id: itemId});
}

Template.updateOrder.onCreated(function () {
  this.subscribe('afProducts');
});


Template.updateOrder.helpers({
  afItems: function () {
    return this.advancedFulfillment.items;
  },
  colorOptions: function (item) {
    let productId = item.productId;
    let product = ReactionCore.Collections.Products.findOne(productId);
    return product.colors;
  },
  sizeOptions: function (item) {
    let productId = item.productId;
    let product = ReactionCore.Collections.Products.findOne(productId);
    let selectedColor = Session.get('colorSelectorFor-' + item._id);
    let variantsWithSelectedColor = _.where(product.variants, {color: selectedColor})
    return _.map(variantsWithSelectedColor, function (variant) {
      return {
        size: variant.size,
        _id: variant._id
      };
    });
  },
  sizeAndColorSelected: function (item) {
    let itemId = item._id;
    let color = Session.get('colorSelectorFor-' + itemId);
    let size = Session.get('sizeSelectorFor-' + itemId);
    if (color && size) {
      return true;
    }
    return false;
  },
  color: function (item) {
    let itemId = item._id;
    let order = this;
    let orderItem = findOrderItem(order, itemId);
    if (orderItem) {
      return orderItem.variants.color;
    }
  },
  size: function (item) {
    let itemId = item._id;
    let order = this;
    let orderItem = findOrderItem(order, itemId);
    if (orderItem) {
      return orderItem.variants.size;
    }
  },
  colorAndSize: function (item) {
    let itemId = item._id;
    let order = this;
    let orderItem = findOrderItem(order, itemId);
    if (orderItem) {
      if (orderItem.variants.size &&  orderItem.variants.color) {
        return true;
      }
      return false;
    }
    return false;
  },
  readyToSelectSize: function (item) {
    let itemId = item._id;
    let session = Session.get('colorSelectorFor-' + itemId);
    if (session) {
      return true;
    }
    return false;
  },
  addingItems: function () {
    let addingItems = Session.get('addItems');
    return addingItems || false;
  }
});


Template.updateOrder.events({
  'change .color-selector': function (event) {
    event.preventDefault();
    let itemId = event.target.dataset.id;
    let selectedColor = event.target.value;
    Session.set('sizeSelectorFor-' + itemId, undefined);
    Session.set('colorSelectorFor-' + itemId, selectedColor);
  },
  'change .size-selector': function (event) {
    event.preventDefault();
    let itemId = event.target.dataset.id;
    let selectedSize = event.target.value;
    Session.set('sizeSelectorFor-' + itemId, selectedSize);
  },
  'click .save-item': function (event) {
    event.preventDefault();
    let itemId = event.target.dataset.id;
    let productId = event.target.dataset.productId;
    let newVariantId = Session.get('sizeSelectorFor-' + itemId);
    let order = this;
    Meteor.call('advancedFulfillment/updateItemsColorAndSize', order, itemId, productId, newVariantId);
  },
  'click .add-new-item': function (event) {
    event.preventDefault();
    let addingItems = !Session.get('addItems') || false;
    Session.set('addItems', addingItems);
  },
  'click .update-rental-dates': function (event) {
    event.preventDefault();
    let orderId = this._id;
    let startDate = new Date($('#' + orderId + ' [name="start"]').val());
    let endDate = new Date($('#' + orderId + ' [name="end"]').val());
    Meteor.call('advancedFulfillment/updateRentalDates', orderId, startDate, endDate);
  }
});
