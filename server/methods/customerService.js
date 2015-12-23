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
  },
  'advancedFulfillment/bundleColorConfirmation': function (orderId, userId) {
    check(orderId, String);
    check(userId, String);
    let history = {
      event: 'bundleColorConfirmed',
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
        bundleMissingColor: false
      }
    });
  },
  'advancedFulfillment/updateSkiPackageWithCustomerInfo': function (orderId, userId, skiId, age, shoeSize, level) {
    check(orderId, String);
    check(userId, String);
    check(skiId, String);
    check(age, Number);
    check(shoeSize, String);
    check(level, String);
    ReactionCore.Collections.Orders.update({
      '_id': orderId,
      'advancedFulfillment.skiPackages._id': skiId
    }, {
      $set: {
        'advancedFulfillment.skiPackages.$.age': age,
        'advancedFulfillment.skiPackages.$.shoeSize': shoeSize,
        'advancedFulfillment.skiPackages.$.skiLevel': level
      }
    });
  }
});
