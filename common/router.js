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
    return this.subscribe('Orders');
  },
  data: function () {
    return {orders: ReactionCore.Collections.Orders.find({
      $or: [{
        'advancedFulfillment.workflow.status': 'orderCreated'
      },
      {
        'advancedFulfillment.workflow.status': 'orderPicking'
      },
      {
        'advancedFulfillment.workflow.status': 'orderPacking'
      },
      {
        'advancedFulfillment.workflow.status': 'orderFulfilled'
      }]
    }, {
      sort: {'advancedFulfillment.shipmentDate': 1}
    }

    )};
  }
});
Router.route('dashboard/advanced-fulfillment/shipping/:date', {
  name: 'dateShipping',
  controller: advancedFulfillmentController,
  template: 'fulfillmentOrders',
  waitOn: function () {
    return this.subscribe('Orders');
  },
  data: function () {
    let rawDate = this.params.date;
    let dayStart = moment(rawDate, 'MM-DD-YYYY').startOf('day')._d;
    let dayEnd = moment(rawDate, 'MM-DD-YYYY').endOf('day')._d;
    return {orders: ReactionCore.Collections.Orders.find({
      $or: [{
        'advancedFulfillment.workflow.status': 'orderCreated'
      },
      {
        'advancedFulfillment.workflow.status': 'orderPicking'
      },
      {
        'advancedFulfillment.workflow.status': 'orderPacking'
      },
      {
        'advancedFulfillment.workflow.status': 'orderFulfilled'
      }],
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

Router.route('dashboard/advanced-fulfillment/orders/status/:status', {
  name: 'orderByStatus',
  template: 'fulfillmentOrders',
  controller: advancedFulfillmentController,
  waitOn: function () {
    return this.subscribe('Orders');
  },
  data: function () {
    let status = this.params.status;
    return {orders: ReactionCore.Collections.Orders.find({
      'advancedFulfillment.workflow.status': status
    })};
  },
  onBeforeAction: function () {
    let status = this.params.status;
    let viableStatuses = ['orderCreated', 'orderPicking', 'orderPacking', 'orderFulfilled'];
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
    return this.subscribe('Orders');
  },
  data: function () {
    return {orders: ReactionCore.Collections.Orders.find({
      // 'advancedFulfillment.workflow.status': 'orderShipping'
      $or: [{
        'advancedFulfillment.workflow.status': 'orderShipping'
      }, {
        'advancedFulfillment.workflow.status': 'orderReturning'
      }, {
        'advancedFulfillment.workflow.status': 'orderInspecting'
      }]}, {
        sort: {'advancedFulfillment.returnDate': 1}
      }
    )};
  }
});

Router.route('dashboard/advanced-fulfillment/returns/:date', {
  name: 'dateReturning',
  controller: advancedFulfillmentController,
  template: 'fulfillmentOrders',
  waitOn: function () {
    return this.subscribe('Orders');
  },
  data: function () {
    let rawDate = this.params.date;
    let dayStart = moment(rawDate, 'MM-DD-YYYY').startOf('day')._d;
    let dayEnd = moment(rawDate, 'MM-DD-YYYY').endOf('day')._d;
    return {orders: ReactionCore.Collections.Orders.find({
      $or: [{
        'advancedFulfillment.workflow.status': 'orderShipping'
      }, {
        'advancedFulfillment.workflow.status': 'orderReturning'
      }, {
        'advancedFulfillment.workflow.status': 'orderInspecting'
      }],
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

