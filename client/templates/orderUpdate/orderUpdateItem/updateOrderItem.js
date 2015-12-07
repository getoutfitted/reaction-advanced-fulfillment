Template.updateOrderItem.helpers({
  item: function () {
    let itemId = Router.current().params.itemId;
    let order = this;
    let regItem = _.findWhere(order.items, {_id: itemId});
    let afItem = _.findWhere(order.advancedFulfillment.items, {_id: itemId});
    return {
      regItem: regItem,
      afItem: afItem
    };
  }
});
