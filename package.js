Package.describe({
  summary: 'Advanced fulfillment tracking for orders through inbound, picking, packing, returns and inventory',
  name: 'getoutfitted:reaction-advanced-fulfillment',
  version: '0.1.0',
  git: 'https://github.com/getoutfitted/reaction-advanced-fulfillment'
});

Npm.depends({
  faker: '3.0.1'
});


Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.2');
  api.use('meteor-platform');
  api.use('less');
  api.use('http');
  api.use('underscore');
  api.use('reactioncommerce:core@0.9.0');
  api.use('reactioncommerce:reaction-accounts@1.2.0');
  api.use('iron:router@1.0.12');
  api.use('momentjs:moment@2.10.6');
  api.use('momentjs:twix@0.7.2');
  api.use('standard-minifiers');
  api.use('steeve:jquery-barcode');


  api.addFiles([
    'server/registry.js',
    'server/hooks/after_copyCartToOrder.js',
    'server/methods/orderDetail.js'
  ], 'server');

  api.addFiles([
    'client/templates/settings/settings.html',
    'client/templates/fulfillmentOrders/fulfillmentOrders.html',
    'client/templates/fulfillmentOrders/fulfillmentOrders.js',
    'client/templates/dashboard/dashboard.html',
    'client/templates/dashboard/dashboard.js',
    'client/templates/orderDetails/orderDetails.html',
    'client/templates/orderDetails/orderDetails.js',
    'client/templates/orderDetails/itemDetails.html',
    'client/templates/orderDetails/itemDetails.js',
    'client/templates/orderQueue/orderQueue.html',
    'client/templates/orderQueue/orderQueue.js',
    'client/templates/pdf/advancedFulfillment.html',
    'client/templates/pdf/advancedFulfillment.js',
    'client/templates/navbar/afNavbar.html',
    'client/templates/navbar/afNavbar.js'
  ], 'client');

  api.addFiles([
    'common/router.js',
    'common/collections.js',
    'common/factories/orders.js',
    'common/factories/ordersWithAF.js'
  ], ['client', 'server']);
});


Package.onTest(function (api) {
  api.use('sanjo:jasmine@0.20.2');
  api.use('underscore');
  api.use('dburles:factory@0.3.10');
  api.use('velocity:html-reporter@0.9.0');
  api.use('velocity:console-reporter@0.1.3');
  api.use('velocity:helpers');

  api.use('reactioncommerce:core@0.9.0');
  api.use('reactioncommerce:bootstrap-theme');
  api.use('getoutfitted:reaction-advanced-fulfillment');

  api.addFiles('tests/jasmine/server/integration/methods.js', 'server');
  api.addFiles('tests/jasmine/server/integration/hooks.js', 'server');
});
