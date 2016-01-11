Template['advancedFulfillment.picker.search'].events({
  'submit #pickerSearch': function (event) {
    event.preventDefault();
    let query = event.target.query.value;
    let order = ReactionCore.Collections.Orders.findOne(
      { $or: [
        { _id: query },
        { shopifyOrderNumber: parseInt(query, 10) }
      ]});
    if (order) {
      let orderId = order._id;
      Router.go('orderDetails', {_id: orderId});
    } else {
      Alerts.removeSeen();
      Alerts.add(query + ' is not a valid order number or order id, please try your search again.', 'danger', {
        autoHide: true
      });
    }
  }
});
