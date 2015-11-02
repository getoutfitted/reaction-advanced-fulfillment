Template.missingOrder.helpers({
  missingItems: function () {
    let items = this.advancedFulfillment.items;
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

Template.missingItem.helpers({
  value: function (productId, variantId) {
    return 12.99;
  //   let variants = Products.findOne(productId).variants;
  //   let thisVariant = _.findWhere(variants, {_id: variantId});
  //   let parent = thisVariant.parentId;
  //   let msrp = _.findWhere(variants, {_id: parent});
  }
})
