Meteor.methods({
  'advancedFulfillment/cancelOrder': function (orderId, userId) {
    check(orderId, String);
    check(userId, String);
    let history = {
      event: 'orderCanceled',
      userId: userId,
      updatedAt: new Date()
    };
    ReactionCore.Collections.Orders.update({
      _id: orderId
    }, {
      $addToSet: {
        history: history
      },
      $set: {
        'advancedFulfillment.workflow.status': 'orderCanceled',
        'advancedFulfillment.impossibleShipDate': false
      }
    });
  }
});
