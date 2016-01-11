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

function getFedexTransitTime(address) {
  const shopifyOrders = ReactionCore.Collections.Packages.findOne({
    name: 'reaction-shopify-orders'
  });

  if (!shopifyOrders || !shopifyOrders.settings.fedex) {
    ReactionCore.Log.warn('Fedex API not setup. Transit Days will not be estimated');
    return false;
  }

  fedexTimeTable = {
    'ONE_DAY': 1,
    'TWO_DAYS': 2,
    'THREE_DAYS': 3,
    'FOUR_DAYS': 4,
    'FIVE_DAYS': 5,
    'SIX_DAYS': 6,
    'SEVEN_DAYS': 7,
    'EIGHT_DAYS': 8,
    'NINE_DAYS': 9,
    'TEN_DAYS': 10,
    'ELEVEN_DAYS': 11,
    'TWELVE_DAYS': 12,
    'THIRTEEN_DAYS': 13,
    'FOURTEEN_DAYS': 14,
    'FIFTEEN_DAYS': 15,
    'SIXTEEN_DAYS': 16,
    'SEVENTEEN_DAYS': 17,
    'EIGHTEEN_DAYS': 18,
    'NINETEEN_DAYS': 19,
    'TWENTY_DAYS': 20
  };

  let fedex = new Fedex({
    'environment': shopifyOrders.settings.fedex.liveApi ? 'live' : 'sandbox',
    'key': shopifyOrders.settings.fedex.key,
    'password': shopifyOrders.settings.fedex.password,
    'account_number': shopifyOrders.settings.fedex.accountNumber,
    'meter_number': shopifyOrders.settings.fedex.meterNumber,
    'imperial': true
  });

  let shipment = {
    ReturnTransitAndCommit: true,
    CarrierCodes: ['FDXE', 'FDXG'],
    RequestedShipment: {
      DropoffType: 'REGULAR_PICKUP',
      ServiceType: 'FEDEX_GROUND', // GROUND_HOME_DELIVERY
      PackagingType: 'YOUR_PACKAGING',
      Shipper: {
        Contact: {
          PersonName: 'Shipper Person',
          CompanyName: 'GetOutfitted',
          PhoneNumber: '5555555555'
        },
        Address: {
          StreetLines: [
            '103 Main St'
          ],
          City: 'Dillon',
          StateOrProvinceCode: 'CO',
          PostalCode: '80435',
          CountryCode: 'US'
        }
      },
      Recipient: {
        Contact: {
          PersonName: 'Receiver Person',
          CompanyName: 'Hotel',
          PhoneNumber: '5555555555'
        },
        Address: {
          StreetLines: [
            address.address1,
            address.address2
          ],
          City: address.city,
          StateOrProvinceCode: address.region,
          PostalCode: address.postal,
          CountryCode: address.country,
          Residential: false // Or true
        }
      },
      ShippingChargesPayment: {
        PaymentType: 'SENDER',
        Payor: {
          ResponsibleParty: {
            AccountNumber: fedex.options.account_number
          }
        }
      },
      PackageCount: '1',
      RequestedPackageLineItems: {
        SequenceNumber: 1,
        GroupPackageCount: 1,
        Weight: {
          Units: 'LB',
          Value: '7.0'
        },
        Dimensions: {
          Length: 24,
          Width: 14,
          Height: 6,
          Units: 'IN'
        }
      }
    }
  };

  let fedexRatesSync = Meteor.wrapAsync(fedex.rates);

  let rates = fedexRatesSync(shipment);
  if (!rates.RateReplyDetails) {
    return false;
  }
  let groundRate = rates.RateReplyDetails[0];
  return fedexTimeTable[groundRate.TransitTime];
}

function buffer() {
  let af = ReactionCore.Collections.Packages.findOne({name: 'reaction-advanced-fulfillment'});
  if (af && af.settings && af.settings.buffer) {
    return af.settings.buffer;
  }
  return {shipping: 0, returning: 0};
}

Meteor.methods({
  'advancedFulfillment/updateOrderWorkflow': function (orderId, userId, status) {
    check(orderId, String);
    check(userId, String);
    check(status, String);
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
    let afItems = order.advancedFulfillment.items;
    let allItemsReturned = _.every(afItems, function (item) {
      return item.workflow.status === 'returned';
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
  'advancedFulfillment/updateOrderNotes': function (orderId, orderNotes) {
    check(orderId, String);
    check(orderNotes, String);
    ReactionCore.Collections.Orders.update({_id: orderId}, {
      $set: {orderNotes: orderNotes}
    });
  },
  'advancedFulfillment/printInvoices': function (startDate, endDate, userId) {
    check(startDate, Date);
    check(endDate, Date);
    check(userId, String);
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
  'advancedFulfillment/updateRentalDates': function (orderId, startDate, endDate) {
    check(orderId, String);
    check(startDate, Date);
    check(endDate, Date);
    let order = ReactionCore.Collections.Orders.findOne(orderId);
    let impossibleShipDate = order.advancedFulfillment.impossibleShipDate;
    if (order.advancedFulfillment.impossibleShipDate) {
      impossibleShipDate = false;
    }
    let infoMissing = order.advancedFulfillment.infoMissing;
    if (order.advancedFulfillment.infoMissing) {
      infoMissing = false;
    }
    let fedexTransitTime = getFedexTransitTime(order.shipping[0]);
    let bufferObject = buffer();
    let shippingBuffer = bufferObject.shipping;
    let returnBuffer = fedexTransitTime ? fedexTimeTable[fedexTransitTime] : bufferObject.returning;

    let rentalLength = moment(endDate).diff(moment(startDate), 'days');
    let shipmentDate = moment(startDate).subtract(shippingBuffer, 'days').toDate();
    let returnDate = moment(endDate).add(returnBuffer, 'days').toDate();
    let arriveBy = moment(startDate).subtract(1, 'days').toDate();
    let returnBy = moment(endDate).add(1, 'days').toDate();
    let orderCreated = {status: 'orderCreated'};
    ReactionCore.Collections.Orders.update({_id: orderId}, {
      $set: {
        'startTime': startDate,
        'endTime': endDate,
        'rentalDays': rentalLength,
        'infoMissing': infoMissing,
        'advancedFulfillment.shipmentDate': shipmentChecker(shipmentDate),
        'advancedFulfillment.returnDate': returnChecker(returnDate),
        'advancedFulfillment.workflow': orderCreated,
        'advancedFulfillment.arriveBy': arriveBy,
        'advancedFulfillment.shipReturnBy': returnBy,
        'advancedFulfillment.impossibleShipDate': impossibleShipDate
      }
    });
  },
  'advancedFulfillment/updateItemsColorAndSize': function (order, itemId, productId, variantId) {
    check(order, Object);
    check(itemId, String);
    check(productId, String);
    check(variantId, String);
    let product = Products.findOne(productId);
    let variants = product.variants;
    let variant = _.findWhere(variants, {_id: variantId});
    let orderItems = order.items;
    let orderNotes = order.orderNotes;

    orderNotes = orderNotes + ' \n Item #' + itemId + ' with SKU#' + variant.sku +
     ' was updated with to have: color:' + variant.color + ' and size: ' + variant.size;
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
      }
    });
  },
  'advancedFulfillment/itemExchange': function (order, oldItemId, type, gender, title, color, variantId) {
    check(order, Object);
    check(oldItemId, String);
    check(type, String);
    check(gender, String);
    check(title, String);
    check(color, String);
    check(variantId, String);
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
    let orderNotes = order.notes + '\nItem # ' + oldAfItem._id + ' - ' + oldAfItem.itemDescription + ' - ' + oldItem.variants.size + ' - ' + oldItem.variants.color + ' was replaced with: \n' + newAfItem.itemDescription + ' - ' + newItem.variants.size + ' - ' + newItem.variants.color;
    ReactionCore.Collections.Orders.update({
      _id: order._id
    }, {
      $set: {
        'items': updatedItems,
        'advancedFulfillment.items': updatedAfItems,
        'orderNotes': orderNotes,
        'itemMissingDetails': !allItemsUpdated
      }
    });
  },
  'advancedFulfillment/addItem': function (order, type, gender, title, color, variantId) {
    check(order, Object);
    check(type, String);
    check(gender, String);
    check(title, String);
    check(color, String);
    check(variantId, String);
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
      itemDescription: product.gender + ' - ' + product.vendor + ' - ' + product.title
    };
    let orderNotes = order.notes + '\n New Item was added to Order:' + newAfItem.itemDescription + ' - ' + newItem.variants.size + ' - ' + newItem.variants.color;
    ReactionCore.Collections.Orders.update({
      _id: order._id
    }, {
      $set: {
        orderNotes: orderNotes
      },
      $addToSet: {
        'items': newItem,
        'advancedFulfillment.items': newAfItem
      }
    });
  }
});
