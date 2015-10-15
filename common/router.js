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
  path: 'dashboard/advanced-fulfillment',
  template: 'dashboardAdvancedFulfillmment'
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
      'advancedFulfillment.workflow.status': {
        $not: 'orderFulfilled'
      }
    })};
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
      'advancedFulfillment.workflow.status': {
        $not: 'orderFulfilled'
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

