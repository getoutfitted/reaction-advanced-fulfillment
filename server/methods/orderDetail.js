// import _ from 'underscore';

function shipmentDateChecker(date, localDelivery, transitTime) {
  if (localDelivery) {
    return date;
  }

  let numberOfWeekendDays = 0;
  let shipDate = moment(date);
  let arrivalDate = moment(shipDate).add(transitTime, 'days');
  let additionalDays = 0;
  let daysToAdd = 0;

  if (moment(arrivalDate).isoWeekday() === 7) {
    shipDate.subtract(2, 'days');
    additionalDays += 2;
    arrivalDate.subtract(2, 'days');
  } else if (moment(arrivalDate).isoWeekday() === 6) {
    shipDate.subtract(1, 'days');
    additionalDays += 1;
    arrivalDate.subtract(1, 'days');
  }

  if (moment(shipDate).isoWeekday() === 7) {
    shipDate.subtract(2, 'days');
    additionalDays += 2;
  } else if (moment(shipDate).isoWeekday() === 6) {
    shipDate.subtract(1, 'days');
    additionalDays += 1;
  }

  const shipmentRange = shipDate.twix(arrivalDate, {allDay: true});
  let iter = shipmentRange.iterate('days');
  //
  while (iter.hasNext()) {
    let isoWeekday = iter.next().isoWeekday();
    if (isoWeekday === 7 || isoWeekday === 6) {
      numberOfWeekendDays += 1;
    }
  }

  daysToAdd = numberOfWeekendDays - additionalDays;
  if (daysToAdd <= 0) {
    daysToAdd = 0;
  }

  return shipDate.subtract(daysToAdd, 'days').toDate();
}

function arrivalDateChecker(date, localDelivery) {
  if (localDelivery) {
    return date;
  }
  if (moment(date).isoWeekday() === 7) {
    return moment(date).subtract(2, 'days').toDate();
  } else if (moment(date).isoWeekday() === 6) {
    return moment(date).subtract(1, 'days').toDate();
  }
  return date;
}

function returnDateChecker(date, localDelivery) {
  if (localDelivery) {
    return date;
  }
  if (moment(date).isoWeekday() === 7) {
    return moment(date).add(1, 'days').toDate();
  }
  return date;
}

function rushShipmentChecker(date) {
  if (moment(date).isoWeekday() === 7) {
    return moment(date).add(1, 'days').toDate();
  } else if (moment(date).isoWeekday() === 6) {
    return moment(date).add(2, 'days').toDate();
  }
  return date.toDate();
}

function rushRequired(arriveBy, transitTime, isLocal) {
  if (isLocal) {
    return false;
  }
  const estimatedArrival = moment().startOf('day').add(transitTime, 'days'); // shipDate as start of day
  return moment(estimatedArrival).diff(moment(arriveBy)) > 0;
}

function isLocalDelivery(postal) {
  let localZips = [
    '80424',
    '80435',
    '80443',
    '80497',
    '80498',
    '81657',
    '81620',
    '81657'
  ];
  return _.contains(localZips, postal);
}

function buffer() {
  let af = ReactionCore.Collections.Packages.findOne({name: 'reaction-advanced-fulfillment'});
  if (af && af.settings && af.settings.buffer) {
    return af.settings.buffer;
  }
  return {shipping: 0, returning: 0};
}

function noteFormattedUser(user) {
  check(user, String);
  let date = moment().format('MM/DD/YY h:mma');
  return  '| <em>' + user + '-' + date + '</em>';
}

function userNameDeterminer(user) {
  check(user, Object);
  if (user.username) {
    return user.username;
  }
  return user.emails[0].address;
}

function anyOrderNotes(orderNotes) {
  if (!orderNotes) {
    return '';
  }
  return orderNotes;
}


Meteor.methods({
  'advancedFulfillment/updateOrderWorkflow': function (orderId, userId, status) {
    check(orderId, String);
    check(userId, String);
    check(status, String);
    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    let workflow = {
      orderCreated: 'orderPrinted',
      orderPrinted: 'orderPicking',
      orderPicking: 'orderPicked',
      orderPicked: 'orderPacking',
      orderPacking: 'orderPacked',
      orderPacked: 'orderReadyToShip',
      orderReadyToShip: 'orderShipped',
      orderShipped: 'orderReturned',
      orderReturned: 'orderCompleted',
      orderIncomplete: 'orderCompleted'
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

  'advancedFulfillment/reverseOrderWorkflow': function (orderId, userId, status) {
    check(orderId, String);
    check(userId, String);
    check(status, String);

    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }

    let reverseWorkflow = {
      orderPrinted: 'orderCreated',
      orderPicking: 'orderPrinted',
      orderPicked: 'orderPicking',
      orderPacking: 'orderPicked',
      orderPacked: 'orderPacking',
      orderReadyToShip: 'orderPacked',
      orderShipped: 'orderReadyToShip',
      orderReturned: 'orderShipped',
      orderIncomplete: 'orderReturned',
      orderCompleted: 'orderReturned'
    };
    let date = new Date();
    let historyEvent = {
      event: reverseWorkflow[status],
      userId: userId,
      updatedAt: date
    };
    ReactionCore.Collections.Orders.update({_id: orderId}, {
      $addToSet: {
        'history': historyEvent,
        'advancedFulfillment.workflow.workflow': status
      },
      $set: {
        'advancedFulfillment.workflow.status': reverseWorkflow[status]
      }
    });
  },

  'advancedFulfillment/orderCompletionVerifier': function (order, userId) {
    check(order, Object);
    check(userId, String);

    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }

    let afItems = order.advancedFulfillment.items;
    let allItemsReturned = _.every(afItems, function (item) {
      return item.workflow.status === 'returned' || item.workflow.status === 'completed';
    });
    let orderStatus = 'orderIncomplete';
    if (allItemsReturned) {
      orderStatus = 'orderCompleted';
    }
    let date = new Date();
    let historyEvent = {
      event: orderStatus,
      userId: userId,
      updatedAt: date
    };
    ReactionCore.Collections.Orders.update({_id: order._id}, {
      $addToSet: {
        'history': historyEvent,
        'advancedFulfillment.workflow.workflow': order.advancedFulfillment.workflow.status
      },
      $set: {
        'advancedFulfillment.workflow.status': orderStatus
      }
    });
  },
  'advancedFulfillment/updateOrderNotes': function (order, orderNotes, user) {
    check(order, Object);
    check(orderNotes, String);
    check(user, String);

    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    if (!order.orderNotes) {
      order.orderNotes = '';
    }
    let userInfo = noteFormattedUser(user);
    let notes = order.orderNotes + '<p>' + orderNotes + userInfo + '</p>';
    ReactionCore.Collections.Orders.update({_id: order._id}, {
      $set: {orderNotes: notes}
    });
  },
  'advancedFulfillment/printInvoices': function (startDate, endDate, userId) {
    check(startDate, Date);
    check(endDate, Date);
    check(userId, String);

    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }

    ReactionCore.Collections.Orders.update({
      'advancedFulfillment.shipmentDate': {
        $gte: startDate,
        $lte: endDate
      }
    }, {
      $set: {
        'advancedFulfillment.workflow.status': 'orderPrinted'
      },
      $addToSet: {
        history: {
          event: 'orderPrinted',
          userId: userId,
          updatedAt: new Date()
        }
      }
    }, {
      multi: true
    });
  },

  'advancedFulfillment/printInvoice': function (orderId, userId) {
    check(orderId, String);
    check(userId, String);

    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }

    ReactionCore.Collections.Orders.update({
      _id: orderId
    }, {
      $set: {
        'advancedFulfillment.workflow.status': 'orderPrinted'
      },
      $addToSet: {
        history: {
          event: 'orderPrinted',
          userId: userId,
          updatedAt: new Date()
        }
      }
    });
  },
  // TODO: This should check availability and not allow updates if availability does not exist.
  // TODO: This should also update the availability calendar
  // Currently just switches dates in AF
  'advancedFulfillment/updateRentalDates': function (orderId, startDate, endDate, userObj) {
    check(orderId, String);
    check(startDate, Date);
    check(endDate, Date);
    check(userObj, Object);

    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }

    const order = ReactionCore.Collections.Orders.findOne(orderId);
    const localDelivery = order.advancedFulfillment.localDelivery;
    let user = userNameDeterminer(userObj);

    let rentalLength = moment(endDate).diff(moment(startDate), 'days');
    let arrivalDate = startDate;
    let returnBy = endDate;
    let shipmentDate = TransitTimes.calculateShippingDayByOrder(_.defaults({startTime: startDate}, order));
    let returnDate = TransitTimes.calculateReturnDayByOrder(_.defaults({endTime: endDate}, order));
    let shippingDays = TransitTimes.calculateTotalShippingDaysByOrder(_.defaults({startTime: startDate}, order));

    let rushOrder = rushRequired(arrivalDate, shippingDays, localDelivery);
    if (rushOrder && !localDelivery) {
      shipmentDate = TransitTimes.date.nextBusinessDay(moment().startOf('day')); // Ship Next Business Day
    }

    if (localDelivery) {
      shipmentDate = arrivalDate; // Local delivery should be delivered the day it's due.
    }

    // TODO: Call some function in RentalProducts to update rental dates as stored in calendar

    let orderNotes = anyOrderNotes(order.orderNotes);
    orderNotes = orderNotes + '<p> Rental Dates updated to: '
    + moment(startDate).format('MM/D/YY') + '-'
    + moment(endDate).format('MM/D/YY')
    + noteFormattedUser(user) + '</p>';

    ReactionCore.Collections.Orders.update({_id: orderId}, {
      $set: {
        'startTime': startDate,
        'endTime': endDate,
        'rentalDays': rentalLength,
        'infoMissing': false,
        'advancedFulfillment.shipmentDate': shipmentDate,
        'advancedFulfillment.returnDate': returnDate,
        'advancedFulfillment.workflow': {status: 'orderCreated'},
        'advancedFulfillment.arriveBy': arrivalDate,
        'advancedFulfillment.shipReturnBy': returnBy,
        'advancedFulfillment.impossibleShipDate': false,
        'orderNotes': orderNotes
      },
      $addToSet: {
        history: {
          event: 'updatedRentalDates',
          userId: userObj._id,
          updatedAt: new Date()
        }
      }
    });
  },

  'advancedFulfillment/updateShippingAddress': function (orderId, address) {
    check(orderId, String);
    check(address, Object);
    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    const user = Meteor.user();
    const userName = user.username || user.emails[0].address;
    const order = ReactionCore.Collections.Orders.findOne(orderId);
    const prevAddress = order.shipping[0].address;
    const localDelivery = TransitTimes.isLocalDelivery(address.postal);
    const transitTime = TransitTimes.calculateTransitTime(address);
    const transitTimeToPrevAddress = TransitTimes.calculateTransitTime(prevAddress);

    let returnDate = order.advancedFulfillment.returnDate;
    let shipmentDate = order.advancedFulfillment.shipmentDate;
    let arrivalDate = order.advancedFulfillment.arrivalDate;
    let returnBy = order.advancedFulfillment.returnBy;

    if (transitTime !== transitTimeToPrevAddress) {
      order.shipping[0].address = address;
      const startDate = order.startTime;
      const endDate = order.endTime;
      const totalShippingDays = TransitTimes.calculateTotalShippingDaysByOrder(order);

      shipmentDate = TransitTimes.calculateShippingDayByOrder(order);
      arrivalDate = startDate;
      returnBy = endDate;
      returnDate = TransitTimes.calculateReturnDayByOrder(order);

      if (localDelivery) {
        shipmentDate = arrivalDate; // Remove transit day from local deliveries
      }

      let rushOrder = rushRequired(arrivalDate, totalShippingDays, localDelivery);
      if (rushOrder && !localDelivery) {
        shipmentDate = TransitTimes.nextBusinessDay(moment().startOf('day'));
      }
    }

    let orderNotes = anyOrderNotes(order.orderNotes);
    // TODO: turn order notes into an array of strings
    // Build updated orderNotes
    orderNotes = orderNotes + '<br /><p> Shipping Address updated from: <br />'
    + prevAddress.fullName + '<br />'
    + prevAddress.address1 + '<br />';

    orderNotes = prevAddress.address2 ? orderNotes + prevAddress.address2 + '<br />' : orderNotes;

    orderNotes = orderNotes + prevAddress.city + ' '
    + prevAddress.region + ', ' + prevAddress.postal
    + noteFormattedUser(userName) + '</p>';

    try {
      ReactionCore.Collections.Orders.update({_id: orderId}, {
        $set: {
          'advancedFulfillment.localDelivery': localDelivery,
          // This line adds a day to transit time because we estimate from first ski day during import.
          'advancedFulfillment.transitTime': transitTime,
          'advancedFulfillment.shipmentDate': shipmentDate,
          'advancedFulfillment.returnDate': returnDate,
          'advancedFulfillment.arriveBy': arrivalDate,
          'advancedFulfillment.shipReturnBy': returnBy,
          'shipping.0.address': address,
          'orderNotes': orderNotes
        },
        $addToSet: {
          history: {
            event: 'orderShippingAddressUpdated',
            userId: Meteor.userId(),
            updatedAt: new Date()
          }
        }
      });
      ReactionCore.Log.info('Successfully updated shipping address for order: ' + order.shopifyOrderNumber);
    } catch (e) {
      ReactionCore.Log.error('Error updating shipping address for order: ' + order.shopifyOrderNumber, e);
    }
  },

  'advancedFulfillment/updateContactInformation': function (orderId, phone, email) {
    check(orderId, String);
    check(phone, String);
    check(email, String);
    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    const order = ReactionCore.Collections.Orders.findOne(orderId);
    try {
      ReactionCore.Collections.Orders.update({_id: orderId}, {
        $set: {
          'email': email,
          'shipping.0.address.phone': phone
        },
        $addToSet: {
          history: {
            event: 'orderContactInfoUpdated',
            userId: Meteor.userId(),
            updatedAt: new Date()
          }
        }
      });
      ReactionCore.Log.info('Successfully updated contact information for order: ' + order.shopifyOrderNumber);
    } catch (e) {
      ReactionCore.Log.error('Error updating contact information for order: ' + order.shopifyOrderNumber, e);
    }
  },

  // TODO: This will need to check availability of items before updating
  'advancedFulfillment/updateItemsColorAndSize': function (order, itemId, productId, variantId, userObj) {
    check(order, Object);
    check(itemId, String);
    check(productId, String);
    check(variantId, String);
    check(userObj, Object);

    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    let user = userNameDeterminer(userObj);
    let product = Products.findOne(productId);
    let variants = product.variants;
    let variant = _.findWhere(variants, {_id: variantId});
    let orderItems = order.items;
    let orderNotes = anyOrderNotes(order.orderNotes);

    orderNotes = orderNotes + '<p>Item Details Added ' + product.gender + '-'
     + product.vendor + '-' + product.title
     + ' was updated with: color:' + variant.color + ' size: ' + variant.size
     + noteFormattedUser(user) + '</p>';

    _.each(orderItems, function (item) {
      if (item._id === itemId) {
        item.variants = variant;
      }
    });
    let afItems = order.advancedFulfillment.items;
    _.each(afItems, function (item) {
      if (item._id === itemId) {
        item.variantId = variant._id;
        item.location = variant.location;
        item.sku = variant.sku;
      }
    });

    let allItemsUpdated = _.every(afItems, function (item) {
      return item.variantId;
    });
    ReactionCore.Collections.Orders.update({_id: order._id}, {
      $set: {
        'items': orderItems,
        'advancedFulfillment.items': afItems,
        'orderNotes': orderNotes,
        'itemMissingDetails': !allItemsUpdated
      },
      $addToSet: {
        history: {
          event: 'itemDetailsAdded',
          userId: userObj._id,
          updatedAt: new Date()
        }
      }
    });
  },

  // TODO: This should check item availability before swapping items
  'advancedFulfillment/itemExchange': function (order, oldItemId, type, gender, title, color, variantId, userObj) {
    check(order, Object);
    check(oldItemId, String);
    check(type, String);
    check(gender, String);
    check(title, String);
    check(color, String);
    check(variantId, String);
    check(userObj, Object);
    // XXX: Way too many params, lets use an options object.

    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    let user = userNameDeterminer(userObj);
    let product = Products.findOne({
      productType: type,
      gender: gender,
      title: title
    });
    let variant = _.findWhere(product.variants, {_id: variantId});
    let orderItems = order.items;
    let oldItem = _.findWhere(orderItems, {_id: oldItemId});
    let orderAfItems = order.advancedFulfillment.items;
    let oldAfItem = _.findWhere(orderAfItems, {_id: oldItemId});
    let id = Random.id();
    let shopId = ReactionCore.getShopId();
    let newItem = {
      _id: id,
      shopId: shopId,
      productId: product._id,
      quantity: 1,
      variants: variant,
      workflow: oldItem.workflow
    };
    let newAfItem = {
      _id: id,
      productId: product._id,
      shopId: shopId,
      quantity: 1,
      variantId: variant._id,
      price: variant.price,
      sku: variant.sku,
      location: variant.location,
      itemDescription: product.gender + ' - ' + product.vendor + ' - ' + product.title,
      workflow: oldAfItem.workflow
    };
    let updatedItems = _.map(orderItems, function (item) {
      if (item._id === oldItemId) {
        return newItem;
      }
      return item;
    });
    let updatedAfItems = _.map(orderAfItems, function (item) {
      if (item._id === oldItemId) {
        return newAfItem;
      }
      return item;
    });
    let allItemsUpdated = _.every(updatedAfItems, function (item) {
      return item.variantId;
    });
    if (!order.orderNotes) {
      order.orderNotes = '';
    }
    let orderNotes = order.orderNotes + '<p>Item Replacement: '
      + oldAfItem.itemDescription + '-'
      + oldItem.variants.size + '- '
      + oldItem.variants.color
      + ' with: ' + newAfItem.itemDescription
      + '-' + newItem.variants.size + '-' + newItem.variants.color
      + noteFormattedUser(user)
      + '</p>';
    ReactionCore.Collections.Orders.update({
      _id: order._id
    }, {
      $set: {
        'items': updatedItems,
        'advancedFulfillment.items': updatedAfItems,
        'orderNotes': orderNotes,
        'itemMissingDetails': !allItemsUpdated
      },
      $addToSet: {
        history: {
          event: 'itemExchange',
          userId: userObj._id,
          updatedAt: new Date
        }
      }
    });
  },

  // TODO: Should check availability before updating items
  'advancedFulfillment/addItem': function (order, type, gender, title, color, variantId, userObj) {
    check(order, Object);
    check(type, String);
    check(gender, String);
    check(title, String);
    check(color, String);
    check(variantId, String);
    check(userObj, Object);
    // XXX: Too many params - use options object.

    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    let user = userNameDeterminer(userObj);
    let product = Products.findOne({
      productType: type,
      gender: gender,
      title: title
    });
    let variant = _.findWhere(product.variants, {_id: variantId});
    let id = Random.id();
    let shopId = ReactionCore.getShopId();
    let newItem = {
      _id: id,
      shopId: shopId,
      productId: product._id,
      quantity: 1,
      variants: variant
    };
    let newAfItem = {
      _id: id,
      productId: product._id,
      shopId: shopId,
      quantity: 1,
      variantId: variant._id,
      price: variant.price,
      sku: variant.sku,
      location: variant.location,
      itemDescription: product.gender + ' - ' + product.vendor + ' - ' + product.title,
      workflow: {
        status: 'In Stock',
        workflow: ['added']
      }
    };
    if (!order.orderNotes) {
      order.orderNotes = '';
    }
    let orderNotes = order.orderNotes + '<p>Item Added: '
      + newAfItem.itemDescription + ' - ' + newItem.variants.size
      + ' - ' + newItem.variants.color
      + noteFormattedUser(user)
      + '</p>';
    ReactionCore.Collections.Orders.update({
      _id: order._id
    }, {
      $set: {
        orderNotes: orderNotes
      },
      $addToSet: {
        'items': newItem,
        'advancedFulfillment.items': newAfItem,
        'history': {
          event: 'itemAdded',
          userId: userObj._id,
          updatedAt: new Date()
        }
      }
    });
  },
  'advancedFulfillment/bypassWorkflowAndComplete': function (orderId, userId) {
    check(orderId, String);
    check(userId, String);
    let history = [
      {
        event: 'bypassedWorkFlowToComplete',
        userId: userId,
        updatedAt: new Date()
      }, {
        event: 'orderCompleted',
        userId: userId,
        updatedAt: new Date()
      }
    ];
    ReactionCore.Collections.Orders.update({
      _id: orderId
    }, {
      $set: {
        'advancedFulfillment.workflow.status': 'orderCompleted'
      },
      $addToSet: {
        history: {
          $each: history
        }
      }
    });
  }
});
