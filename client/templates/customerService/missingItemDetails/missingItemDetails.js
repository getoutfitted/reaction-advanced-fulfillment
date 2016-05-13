Template.missingItemDetails.onCreated(function () {
  this.subscribe('custServOrders');
});

Template.missingItemDetails.helpers({
  missingItemsFromOrder: function () {
    return ReactionCore.Collections.Orders.find({
      itemMissingDetails: true
    });
  }
});
