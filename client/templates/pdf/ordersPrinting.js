Template.advancedFulfillmentOrdersPrint.helpers({
  humanReadableDate: function (day) {
    // let date = this.advancedFulfillment.shipmentDate;
    return moment(day).format('MMMM Do, YYYY');
  },
  shippingAddress: function (order) {
    return order.shipping[0].address;
  },
  billingAddress: function (order) {
    return order.billing[0].address;
  },
  itemAttr: function (attr) {
    item = _.findWhere(Template.parentData().items, {_id: this._id});
    return item.variants[attr];
  }
});
