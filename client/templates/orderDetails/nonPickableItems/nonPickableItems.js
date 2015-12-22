Template.nonPickableItems.helpers({
  qty: function (type) {
    return this.advancedFulfillment.damageCoverage[type].qty;
  },
  subtotal: function (type) {
    return this.advancedFulfillment.damageCoverage[type].subtotal;
  }
});
