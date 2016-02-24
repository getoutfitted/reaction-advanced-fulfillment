// let shopHandle;
// Tracker.autorun(function () {
//   if (ReactionCore.ready()) {
//     shopHandle = ReactionCore.getShopName().toLowerCase();
//   }
// });

let afRoutes = ReactionRouter.group({
  prefix: '/reaction/dashboard/advanced-fulfillment',
  name: 'advancedFulfillment'
});

afRoutes.route('/', {
  name: 'dashboard/advanced-fulfillment',
  action: function () {
    BlazeLayout.render('coreAdminLayout', {
      layoutHeader: 'layoutHeader',
      dashboardHeader: 'dashboardHeader',
      template: 'fulfillmentOrders',
      layoutFooter: 'layoutFooter',
      dashboardControls: 'dashboardControls'
    });
  }
});

afRoutes.route('/picker', {
  name: 'advancedFulfillment.picker',
  action: function () {
    BlazeLayout.render('coreAdminLayout', {
      layoutHeader: 'layoutHeader',
      dashboardHeader: '',
      template: 'advancedFulfillment.picker.search',
      layoutFooter: 'layoutFooter',
      dashboardControls: 'dashboardControls'
    });
  }
});

afRoutes.route('/shipping', {
  name: 'allShipping',
  action: function () {
    BlazeLayout.render('coreAdminLayout', {
      layoutHeader: 'layoutHeader',
      dashboardHeader: 'afNavbar',
      template: 'fulfillmentOrders',
      layoutFooter: 'layoutFooter',
      dashboardControls: 'dashboardControls'
    });
  }
});

afRoutes.route('/shipping/:date', {
  name: 'dateShipping',
  action: function () {
    BlazeLayout.render('coreAdminLayout', {
      layoutHeader: 'layoutHeader',
      dashboardHeader: 'afNavbar',
      template: 'fulfillmentOrders',
      layoutFooter: 'layoutFooter',
      dashboardControls: 'dashboardControls'
    });
  }
});

afRoutes.route('/order/:_id', {
  name: 'orderDetails',
  action: function () {
    BlazeLayout.render('coreAdminLayout', {
      layoutHeader: 'layoutHeader',
      dashboardHeader: 'afNavbar',
      template: 'orderDetails',
      layoutFooter: 'layoutFooter',
      dashboardControls: 'dashboardControls'
    });
  }
});

afRoutes.route('/orders/status/:status', {
  name: 'orderByStatus',
  action: function () {
    BlazeLayout.render('coreAdminLayout', {
      layoutHeader: 'layoutHeader',
      dashboardHeader: 'afNavbar',
      template: 'fulfillmentOrder',
      layoutFooter: 'layoutFooter',
      dashboardControls: 'dashboardControls'
    });
  }
});

afRoutes.route('/local-deliveries', {
  name: 'allLocalDeliveries',
  action: function () {
    BlazeLayout.render('coreAdminLayout', {
      layoutHeader: 'layoutHeader',
      dashboardHeader: 'afNavbar',
      template: 'fulfillmentOrder',
      layoutFooter: 'layoutFooter',
      dashboardControls: 'dashboardControls'
    });
  }
});


// advancedFulfillmentController = ShopController.extend({
//   onBeforeAction: function () {
//     const advancedFulfillment = ReactionCore.Collections.Packages.findOne({
//       name: 'reaction-advanced-fulfillment'
//     });
//     if (!advancedFulfillment.enabled) {
//       this.render('notFound');
//     } else {
//       if (!ReactionCore.hasPermission(['admin', 'owner', 'dashboard/advanced-fulfillment', 'reaction-advanced-fulfillment'])) {
//         this.render("layoutHeader", {
//           to: "layoutHeader"
//         });
//         this.render("layoutFooter", {
//           to: "layoutFooter"
//         });
//         this.render("unauthorized");
//       } else {
//         this.next();
//       }
//     }
//   }
// });
// /*
//  * AF Print Controller
//  */

// let advancedFulfillmentPrintController = RouteController.extend({
//   onBeforeAction: function () {
//     if (!ReactionCore.hasPermission(['admin', 'owner', 'dashboard/advanced-fulfillment', 'reaction-advanced-fulfillment'])) {
//       this.render("unauthorized");
//     } else {
//       this.next();
//     }
//   }
// });

// Router.route('dashboard/advanced-fulfillment', {
//   name: 'dashboard/advanced-fulfillment',
//   path: 'dashboard/advanced-fulfillment',
//   template: 'fulfillmentOrders',
//   controller: 'ShopAdminController'
// });

// Router.route('dashboard/advanced-fulfillment/picker', {
//   name: 'advancedFulfillment.picker',
//   path: 'dashboard/advanced-fulfillment/picker',
//   template: 'advancedFulfillment.picker.search',
//   controller: 'ShopAdminController'
// });

// Router.route('dashboard/advanced-fulfillment/shipping', {
//   name: 'allShipping',
//   controller: advancedFulfillmentController,
//   template: 'fulfillmentOrders'
// });

// Router.route('dashboard/advanced-fulfillment/shipping/:date', {
//   name: 'dateShipping',
//   controller: advancedFulfillmentController,
//   template: 'fulfillmentOrders'
// });

// Router.route('dashboard/advanced-fulfillment/local-deliveries', {
//   name: 'allLocalDeliveries',
//   controller: advancedFulfillmentController,
//   template: 'fulfillmentOrders'
// });

// Router.route('dashboard/advanced-fulfillment/local-delivery/:date', {
//   name: 'dateLocalDelivery',
//   controller: advancedFulfillmentController,
//   template: 'fulfillmentOrders'
// });

// Router.route('dashboard/advanced-fulfillment/order/:_id', {
//   name: 'orderDetails',
//   template: 'orderDetails',
//   controller: advancedFulfillmentController
// });

// Router.route('dashboard/advanced-fulfillment/order-queue', {
//   name: 'orderQueue',
//   template: 'orderQueue',
//   controller: advancedFulfillmentController
// });

// Router.route('dashboard/advanced-fulfillment/order/pdf/:_id', {
//   name: 'advancedFulfillmentPDF',
//   controller: advancedFulfillmentPrintController,
//   path: 'dashboard/advanced-fulfillment/order/pdf/:_id',
//   template: 'advancedFulfillmentPDF',
//   onBeforeAction() {
//     this.layout('print');
//     return this.next();
//   }
// });


// Router.route('dashboard/advanced-fulfillment/order/local-delivery-label-pdf/:_id', {
//   name: 'localDeliveryLabelPDF',
//   controller: advancedFulfillmentPrintController,
//   path: 'dashboard/advanced-fulfillment/order/local-delivery-label-pdf/:_id',
//   template: 'localDeliveryLabelPDF',
//   onBeforeAction() {
//     this.layout('print');
//     return this.next();
//   }
// });

// Router.route('dashboard/advanced-fulfillment/orders/pdf/date/:date', {
//   name: 'orders.printAllForDate',
//   controller: advancedFulfillmentPrintController,
//   path: 'dashboard/advanced-fulfillment/orders/pdf/date/:date',
//   template: 'advancedFulfillmentOrdersPrint',
//   onBeforeAction() {
//     this.layout('print');
//     return this.next();
//   }
// });

// Router.route('dashboard/advanced-fulfillment/orders/pdf/selected', {
//   name: 'orders.printSelected',
//   controller: advancedFulfillmentPrintController,
//   path: 'dashboard/advanced-fulfillment/orders/pdf/selected',
//   template: 'advancedFulfillmentOrdersPrint',
//   onBeforeAction() {
//     this.layout('print');
//     return this.next();
//   }
// });

// Router.route('dashboard/advanced-fulfillment/orders/status/:status', {
//   name: 'orderByStatus',
//   template: 'fulfillmentOrders',
//   controller: advancedFulfillmentController

// });

// Router.route('dashboard/advanced-fulfillment/returns', {
//   name: 'returns',
//   template: 'returnOrders',
//   controller: advancedFulfillmentController
// });

// Router.route('dashboard/advanced-fulfillment/returns/:date', {
//   name: 'dateReturning',
//   controller: advancedFulfillmentController,
//   template: 'returnOrders'
// });

// Router.route('dashboard/advanced-fulfillment/missing', {
//   name: 'missing',
//   controller: advancedFulfillmentController,
//   template: 'missingDamaged'
// });

// Router.route('dashboard/advanced-fulfillment/damaged', {
//   name: 'damaged',
//   controller: advancedFulfillmentController,
//   template: 'missingDamaged'
// });

// Router.route('dashboard/advanced-fulfillment/search', {
//   name: 'searchOrders',
//   controller: advancedFulfillmentController,
//   template: 'searchOrders'
// });

// Router.route('dashboard/advanced-fulfillment/update-order/:_id', {
//   name: 'updateOrder',
//   controller: advancedFulfillmentController,
//   template: 'updateOrder'
// });

// Router.route('dashboard/advanced-fulfillment/update-order/:orderId/:itemId', {
//   name: 'updateOrderItem',
//   controller: advancedFulfillmentController,
//   template: 'updateOrderItem'
// });

// Router.route('dashboard/advanced-fulfillment/customer-service/impossible-dates', {
//   name: 'impossibleDates',
//   controller: advancedFulfillmentController,
//   template: 'impossibleDates'
// });

// Router.route('dashboard/advanced-fulfillment/customer-service/missing-rental-dates', {
//   name: 'missingRentalDates',
//   controller: advancedFulfillmentController,
//   template: 'missingRentalDates'
// });

// Router.route('dashboard/advanced-fulfillment/customer-service/missing-item-details', {
//   name: 'missingItemDetails',
//   controller: advancedFulfillmentController,
//   template: 'missingItemDetails'
// });

// Router.route('dashboard/advanced-fulfillment/customer-service/missing-bundle-colors', {
//   name: 'missingBundleColors',
//   controller: advancedFulfillmentController,
//   template: 'missingBundleColors'
// });

// Router.route('dashboard/advanced-fulfillment/customer-service/non-warehouse-orders', {
//   name: 'nonWarehouseOrders',
//   controller: advancedFulfillmentController,
//   template: 'nonWarehouseOrders'
// });
