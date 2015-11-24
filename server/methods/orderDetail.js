function shipmentChecker(date) {
  if (moment(date).isoWeekday() === 7) {
    return moment(date).subtract(2, 'days').toDate();
  } else if (moment(date).isoWeekday() === 6) {
    return moment(date).subtract(1, 'days').toDate();
  }
  return date;
}

function returnChecker(date) {
  if (moment(date).isoWeekday() === 7) {
    return moment(date).add(1, 'days').toDate();
  }
  return date;
}

function buffer() {
  let settings = ReactionCore.Collections.Packages.findOne({name: 'reaction-advanced-fulfillment'}).settings;
  if (settings.buffer) {
    return settings.buffer;
  }
  return {shipping: 0, returing: 0};
}

Meteor.methods({
  'advancedFulfillment/updateOrderWorkflow': function (orderId, userId, status) {
    check(orderId, String);
    check(userId, String);
    check(status, String);
    let workflow = {
      orderCreated: 'orderPicking',
      orderPicking: 'orderPacking',
      orderPacking: 'orderFulfilled',
      orderFulfilled: 'orderShipping',
      orderShipping: 'orderReturning',
      orderReturning: 'orderInspecting'
    };
    let date = new Date();
    let historyEvent = {
      event: workflow[status],
      userId: userId,
      updatedAt: date
    };
    ReactionCore.Collections.Orders.update({_id: orderId}, {
      $addToSet: {
        'history': historyEvent,
        'advancedFulfillment.workflow.workflow': status
      },
      $set: {
        'advancedFulfillment.workflow.status': workflow[status]
      }
    });
  },
  'advancedFulfillment/orderCompleted': function (order, userId) {
    check(order, Object);
    check(userId, String);
    let date = new Date();
    let historyEvent = {
      event: 'orderCompleted',
      userId: userId,
      updatedAt: date
    };
    ReactionCore.Collections.Orders.update({_id: order._id}, {
      $addToSet: {
        'history': historyEvent,
        'advancedFulfillment.workflow.workflow': 'orderInspected'
      },
      $set: {
        'advancedFulfillment.workflow.status': 'orderCompleted'
      }
    });
  },
  'advancedFulfillment/orderIncomplete': function (order, userId) {
    check(order, Object);
    check(userId, String);
    let date = new Date();
    let historyEvent = {
      event: 'orderIncomplete',
      userId: userId,
      updatedAt: date
    };
    ReactionCore.Collections.Orders.update({_id: order._id}, {
      $addToSet: {
        'history': historyEvent,
        'advancedFulfillment.workflow.workflow': 'orderInspected'
      },
      $set: {
        'advancedFulfillment.workflow.status': 'orderIncomplete'
      }
    });
  },
  'advancedFulfillment/updateRentalDates': function (orderId, startDate, endDate) {
    check(orderId, String);
    check(startDate, Date);
    check(endDate, Date);
    let rentalLength = moment(endDate).diff(moment(startDate), 'days');
    let bufferObject = buffer();
    let shippingBuffer = bufferObject.shipping;
    let returnBuffer = bufferObject.returning;
    let shipmentDate = moment(startDate).subtract(shippingBuffer, 'days').toDate();
    let returnDate = moment(endDate).add(returnBuffer, 'days').toDate();
    let orderCreated = {status: 'orderCreated'};
    ReactionCore.Collections.Orders.update({_id: orderId}, {
      $set: {
        startTime: startDate,
        endTime: endDate,
        rentalDays: rentalLength,
        infoMissing: false,
        'advancedFulfillment.shipmentDate': shipmentChecker(shipmentDate),
        'advancedFulfillment.returnDate': returnChecker(returnDate),
        'advancedFulfillment.workflow': orderCreated
      }
    });
  },
  'advancedFulfillment/updateOrderNotes': function (orderId, orderNotes) {
    check(orderId, String);
    check(orderNotes, String);
    ReactionCore.Collections.Orders.update({_id: orderId}, {
      $set: {orderNotes: orderNotes}
    });
  }
});
