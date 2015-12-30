advancedFulfillmentController = ShopAdminController.extend({
  onBeforeAction: function () {
    let advancedFulfillment = ReactionCore.Collections.Packages.findOne({
      name: 'reaction-advanced-fulfillment'
    });
    if (! advancedFulfillment.enabled) {
      this.render('notFound');
    } else {
      this.next();
    }
  }
});

Router.route('dashboard/advanced-fulfillment', {
  name: 'dashboard/advanced-fulfillment',
  path: 'dashboard/advanced-fulfillment',
  template: 'dashboardAdvancedFulfillmment',
  controller: 'ShopAdminController',
  waitOn: function () {
    return this.subscribe('Orders');
  }
});

Router.route('dashboard/advanced-fulfillment/shipping', {
  name: 'allShipping',
  controller: advancedFulfillmentController,
  template: 'fulfillmentOrders',
  waitOn: function () {
    return this.subscribe('afOrders');
  },
  data: function () {
    return {orders: ReactionCore.Collections.Orders.find({
      'items': {$ne: []},
      'advancedFulfillment.workflow.status': {
        $in: AdvancedFulfillment.orderActive
      },
      'startTime': {$ne: undefined}
    }, {
      sort: {
        'advancedFulfillment.shipmentDate': 1
      }
    }

    )};
  }
});

Router.route('dashboard/advanced-fulfillment/shipping/:date', {
  name: 'dateShipping',
  controller: advancedFulfillmentController,
  template: 'fulfillmentOrders',
  waitOn: function () {
    return this.subscribe('afOrders');
  },
  data: function () {
    let rawDate = this.params.date;
    let dayStart = moment(rawDate, 'MM-DD-YYYY').startOf('day')._d;
    let dayEnd = moment(rawDate, 'MM-DD-YYYY').endOf('day')._d;
    return {orders: ReactionCore.Collections.Orders.find({
      'advancedFulfillment.workflow.status': {
        $in: AdvancedFulfillment.orderActive
      },
      'advancedFulfillment.shipmentDate': {
        $gte: new Date(dayStart),
        $lte: new Date(dayEnd)
      }
    })};
  },
  onBeforeAction: function () {
    let date = this.params.date;
    let validDate = moment(date, 'MM-DD-YYYY').isValid();
    if (validDate) {
      this.next();
    }  else {
      this.render('notFound');
    }
  }
});

Router.route('dashboard/advanced-fulfillment/local-deliveries', {
  name: 'allLocalDeliveries',
  controller: advancedFulfillmentController,
  template: 'fulfillmentOrders',
  waitOn: function () {
    return this.subscribe('afOrders');
  },
  data: function () {
    return {orders: ReactionCore.Collections.Orders.find({
      'items': {$ne: []},
      'advancedFulfillment.localDelivery': true,
      'advancedFulfillment.workflow.status': {
        $in: AdvancedFulfillment.orderActive
      }
    }, {
      sort: {'advancedFulfillment.shipmentDate': 1}
    }

    )};
  }
});

Router.route('dashboard/advanced-fulfillment/local-delivery/:date', {
  name: 'dateLocalDelivery',
  controller: advancedFulfillmentController,
  template: 'fulfillmentOrders',
  waitOn: function () {
    return this.subscribe('afOrders');
  },
  data: function () {
    let rawDate = this.params.date;
    let dayStart = moment(rawDate, 'MM-DD-YYYY').startOf('day')._d;
    let dayEnd = moment(rawDate, 'MM-DD-YYYY').endOf('day')._d;
    return {orders: ReactionCore.Collections.Orders.find({
      'advancedFulfillment.localDelivery': true,
      'advancedFulfillment.workflow.status': {
        $in: AdvancedFulfillment.orderActive
      },
      'advancedFulfillment.shipmentDate': {
        $gte: new Date(dayStart),
        $lte: new Date(dayEnd)
      }
    })};
  },
  onBeforeAction: function () {
    let date = this.params.date;
    let validDate = moment(date, 'MM-DD-YYYY').isValid();
    if (validDate) {
      this.next();
    }  else {
      this.render('notFound');
    }
  }
});

Router.route('dashboard/advanced-fulfillment/order/:_id', {
  name: 'orderDetails',
  template: 'orderDetails',
  controller: advancedFulfillmentController,
  waitOn: function () {
    return this.subscribe('Orders');
  },
  data: function () {
    let orderId = this.params._id;
    return ReactionCore.Collections.Orders.findOne({_id: orderId});
  }
});

Router.route('dashboard/advanced-fulfillment/order-queue', {
  name: 'orderQueue',
  template: 'orderQueue',
  controller: advancedFulfillmentController,
  waitOn: function () {
    return this.subscribe('Orders');
  }
});

Router.route('dashboard/advanced-fulfillment/order/pdf/:_id', {
  name: 'advancedFulfillmentPDF',
  controller: PrintController,
  path: 'dashboard/advanced-fulfillment/order/pdf/:_id',
  template: 'advancedFulfillmentPDF',
  onBeforeAction() {
    this.layout('print');
    return this.next();
  },
  subscriptions: function () {
    this.subscribe('Orders');
  },
  data: function () {
    if (this.ready()) {
      return ReactionCore.Collections.Orders.findOne({
        _id: this.params._id
      });
    }
  }
});

Router.route('dashboard/advanced-fulfillment/orders/pdf/:date', {
  name: 'orders.printAllForDate',
  controller: PrintController,
  path: 'dashboard/advanced-fulfillment/orders/pdf/:date',
  template: 'advancedFulfillmentOrdersPrint',
  onBeforeAction() {
    this.layout('print');
    return this.next();
  },
  subscriptions: function () {
    this.subscribe('Orders');
  },
  data: function () {
    let day = this.params.date;
    let startOfDay = moment(day, 'MM-DD-YYYY').startOf('day').toDate();
    let endOfDay = moment(day, 'MM-DD-YYYY').endOf('day').toDate();
    return {
      orders: ReactionCore.Collections.Orders.find({
        'advancedFulfillment.workflow.status': {
          $in: AdvancedFulfillment.orderActive
        },
        'advancedFulfillment.shipmentDate': {
          $gte: startOfDay,
          $lte: endOfDay
        }
      })
    };
  }
});

Router.route('dashboard/advanced-fulfillment/orders/status/:status', {
  name: 'orderByStatus',
  template: 'fulfillmentOrders',
  controller: advancedFulfillmentController,
  waitOn: function () {
    return this.subscribe('afOrders');
  },
  data: function () {
    let status = this.params.status;
    return {orders: ReactionCore.Collections.Orders.find({
      'advancedFulfillment.workflow.status': status
    }, {sort: {'advancedFulfillment.shipmentDate': 1}})};
  },
  onBeforeAction: function () {
    let status = this.params.status;
    let viableStatuses = [
      'orderCreated',
      'orderPrinted',
      'orderPicking',
      'orderPicked',
      'orderPacking',
      'orderPacked',
      'orderReadyToShip',
      'orderShipped',
      'orderReturned',
      'orderCompleted',
      'orderIncomplete'
    ];
    let validStatus = _.contains(viableStatuses, status);
    if (validStatus) {
      this.next();
    }  else {
      this.render('notFound');
    }
  }
});

Router.route('dashboard/advanced-fulfillment/returns', {
  name: 'returns',
  template: 'fulfillmentOrders',
  controller: advancedFulfillmentController,
  waitOn: function () {
    return this.subscribe('afOrders');
  },
  data: function () {
    return {orders: ReactionCore.Collections.Orders.find({
      'advancedFulfillment.workflow.status': {
        $in: [
          'orderShipped',
          'orderReturned'
        ]
      }
    }, {
      sort: {'advancedFulfillment.returnDate': 1}
    })};
  }
});

Router.route('dashboard/advanced-fulfillment/returns/:date', {
  name: 'dateReturning',
  controller: advancedFulfillmentController,
  template: 'fulfillmentOrders',
  waitOn: function () {
    return this.subscribe('afOrders');
  },
  data: function () {
    let rawDate = this.params.date;
    let dayStart = moment(rawDate, 'MM-DD-YYYY').startOf('day')._d;
    let dayEnd = moment(rawDate, 'MM-DD-YYYY').endOf('day')._d;
    return {orders: ReactionCore.Collections.Orders.find({
      'advancedFulfillment.workflow.status': {
        $in: [
          'orderShipped',
          'orderReturned'
        ]
      },
      'advancedFulfillment.returnDate': {
        $gte: new Date(dayStart),
        $lte: new Date(dayEnd)
      }
    })};
  },
  onBeforeAction: function () {
    let date = this.params.date;
    let validDate = moment(date, 'MM-DD-YYYY').isValid();
    if (validDate) {
      this.next();
    }  else {
      this.render('notFound');
    }
  }
});

Router.route('dashboard/advanced-fulfillment/missing', {
  name: 'missing',
  controller: advancedFulfillmentController,
  template: 'missingDamaged',
  waitOn: function () {
    return this.subscribe('Orders');
  },
  data: function () {
    return {orders: ReactionCore.Collections.Orders.find({
      'advancedFulfillment.items.workflow.status': 'missing'})
  };}
});

Router.route('dashboard/advanced-fulfillment/damaged', {
  name: 'damaged',
  controller: advancedFulfillmentController,
  template: 'missingDamaged',
  waitOn: function () {
    return this.subscribe('Orders');
  },
  data: function () {
    return {orders: ReactionCore.Collections.Orders.find({
      'advancedFulfillment.items.workflow.status': 'damaged'})
  };}
});

Router.route('dashboard/advanced-fulfillment/search', {
  name: 'searchOrders',
  controller: advancedFulfillmentController,
  template: 'searchOrders',
  waitOn: function () {
    return this.subscribe('Orders');
  }
});

Router.route('dashboard/advanced-fulfillment/update-order/:orderNumber', {
  name: 'updateOrder',
  controller: advancedFulfillmentController,
  template: 'updateOrder',
  waitOn: function () {
    this.subscribe('afProducts');
    return this.subscribe('Orders');
  },
  data: function () {
    let orderNumber = this.params.orderNumber;
    let order = ReactionCore.Collections.Orders.findOne({
      $or: [
        {_id: orderNumber},
        {shopifyOrderNumber: parseInt(orderNumber)}
      ]
    });
    return order;
  },
  onBeforeAction: function () {
    let orderNumber = this.params.orderNumber;
    let validOrder = ReactionCore.Collections.Orders.findOne({
      $or: [
        {_id: orderNumber},
        {shopifyOrderNumber: parseInt(orderNumber)}
      ]
    });
    if (validOrder) {
      this.next();
    }  else {
      this.render('notFound');
    }
  }
});

Router.route('dashboard/advanced-fulfillment/update-order/:orderNumber/:itemId', {
  name: 'updateOrderItem',
  controller: advancedFulfillmentController,
  template: 'updateOrderItem',
  waitOn: function () {
    this.subscribe('afProducts');
    return this.subscribe('Orders');
  },
  data: function () {
    let orderNumber = this.params.orderNumber;
    let order = ReactionCore.Collections.Orders.findOne({
      $or: [
        {_id: orderNumber},
        {shopifyOrderNumber: parseInt(orderNumber)}
      ]
    });
    return order;
  },
  onBeforeAction: function () {
    let orderNumber = this.params.orderNumber;
    let validOrder = ReactionCore.Collections.Orders.findOne({
      $or: [
        {_id: orderNumber},
        {shopifyOrderNumber: parseInt(orderNumber)}
      ]
    });
    if (validOrder) {
      this.next();
    }  else {
      this.render('notFound');
    }
  }
});

Router.route('dashboard/advanced-fulfillment/customer-service/impossible-dates', {
  name: 'impossibleDates',
  controller: advancedFulfillmentController,
  template: 'impossibleDates',
  waitOn: function () {
    return this.subscribe('Orders');
  }
});

Router.route('dashboard/advanced-fulfillment/customer-service/missing-rental-dates', {
  name: 'missingRentalDates',
  controller: advancedFulfillmentController,
  template: 'missingRentalDates',
  waitOn: function () {
    return this.subscribe('Orders');
  }
});

Router.route('dashboard/advanced-fulfillment/customer-service/missing-item-details', {
  name: 'missingItemDetails',
  controller: advancedFulfillmentController,
  template: 'missingItemDetails',
  waitOn: function () {
    return this.subscribe('Orders');
  }
});

Router.route('dashboard/advanced-fulfillment/customer-service/missing-bundle-colors', {
  name: 'missingBundleColors',
  controller: advancedFulfillmentController,
  template: 'missingBundleColors',
  waitOn: function () {
    return this.subscribe('Orders');
  }
});
