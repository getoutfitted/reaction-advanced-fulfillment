function findOrderItem(order, itemId) {
  return _.findWhere(order.items, {_id: itemId});
}


Template.updateOrder.helpers({
  afItems: function () {
    return this.advancedFulfillment.items;
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
});
