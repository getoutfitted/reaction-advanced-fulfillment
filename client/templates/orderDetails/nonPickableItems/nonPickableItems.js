Template.nonPickableItems.helpers({
  skiPackagesPurchased: function () {
    return this.advancedFulfillment.skiPackagesPurchased;
  }
});

Template.damageCoverage.helpers({
  qty: function (type) {
    return this.advancedFulfillment.damageCoverage[type].qty;
  },
  subtotal: function (type) {
    return this.advancedFulfillment.damageCoverage[type].subtotal;
  }
});

Template.skiPackages.helpers({
  skiPackages: function () {
    return this.advancedFulfillment.skiPackages;
  }
});
