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
    let order = ReactionCore.Collections.Orders.findOne(orderId);
    let fedexTransitTime = getFedexTransitTime(order.shipping[0]);
    let bufferObject = buffer();
    let shippingBuffer = bufferObject.shipping;
    let returnBuffer = fedexTransitTime ? fedexTimeTable[fedexTransitTime] : bufferObject.returning;

    let rentalLength = moment(endDate).diff(moment(startDate), 'days');
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
