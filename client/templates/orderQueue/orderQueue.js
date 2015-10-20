Template.orderQueue.helpers({
  myOrders: function () {
    let userId = Meteor.userId();
    return  ReactionCore.Collections.Orders.find({'history.userId': userId});
  },
  myPickedOrders: function () {
    let userId = Meteor.userId();
    return  ReactionCore.Collections.Orders.find({
      'history.userId': userId,
      'history.event': 'orderPicking'
    });
  },
  myCurrentPickingOrders: function () {
    let userId = Meteor.userId();
    return  ReactionCore.Collections.Orders.find({
      'history.userId': userId,
      'history.event': 'orderPicking',
      'advancedFulfillment.workflow.status': 'orderPicking'
    });
  },
  myCurrentPackingOrders: function () {
    let userId = Meteor.userId();
    return  ReactionCore.Collections.Orders.find({
      'history.userId': userId,
      'history.event': 'orderPacking',
      'advancedFulfillment.workflow.status': 'orderPacking'
    });
  },
    // return  ReactionCore.Collections.Orders.find({'history.userId': userId, 'history.event': 'orderPicking'}).sort({'history.$.updatedAt': 1});
  myPackedOrders: function () {
    let userId = Meteor.userId();
    return  ReactionCore.Collections.Orders.find({
      'history.userId': userId,
      'history.event': 'orderPacking'
    });
  }
});
