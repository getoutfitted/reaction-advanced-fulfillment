Template.advancedFulfillmentOrdersPrint.onCreated(function () {
  Blaze._allowJavascriptUrls();
  let date = Router.current().params.date;
  if (date) {
    this.subscribe('ordersShippingOnDate', date);
  } else {
    this.subscribe('selectedOrders', JSON.parse(localStorage.getItem('selectedOrdersToPrint')));
  }
});

Template.advancedFulfillmentOrdersPrint.helpers({
  humanReadableDate: function (day) {
    // let date = this.advancedFulfillment.shipmentDate;
    return moment(day).format('MMMM Do, YYYY');
  },
  shippingAddress: function (order) {
    if (!order.shipping) { // TODO: Build default message for missing shipping address
      return {};
    }
    return order.shipping[0].address;
  },
  billingAddress: function (order) {
    // TODO: Build default message for missing billing address
    if (!order.billing) {
      return {};
    }
    return order.billing[0].address;
  },
  itemAttr: function (attr) {
    item = _.findWhere(Template.parentData().items, {_id: this._id});
    if (!item) {
      return false;
    }
    return item.variants[attr];
  },
  orders: function () {
    let day = Router.current().params.date;
    if (day) {
      let startOfDay = moment(day, 'MM-DD-YYYY').startOf('day').toDate();
      let endOfDay = moment(day, 'MM-DD-YYYY').endOf('day').toDate();
      return ReactionCore.Collections.Orders.find({
        'advancedFulfillment.workflow.status': {
          $in: AdvancedFulfillment.orderActive
        },
        'advancedFulfillment.shipmentDate': {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }, {
        sort: {
          shopifyOrderNumber: 1
        }
      });
    }
    const selectedOrders = JSON.parse(localStorage.selectedOrdersToPrint || '[]');
    return ReactionCore.Collections.Orders.find({
      '_id': {
        $in: selectedOrders
      },
      'advancedFulfillment.workflow.status': {
        $in: AdvancedFulfillment.orderActive
      }
    });
  }
});
