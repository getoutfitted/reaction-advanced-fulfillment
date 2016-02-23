// ReactionCore.registerPackage({
//   label: 'Advanced Fulfillment',
//   name: 'reaction-advanced-fulfillment',
//   icon: 'fa fa-barcode',
//   autoEnable: false,
//   registry: [
//     // Dashboard card
//     {
//       provides: 'dashboard',
//       name: 'advancedFulfillment',
//       label: 'Advanced Fulfillment',
//       description: 'Advanced Order Fulfillment Tracking',
//       route: '/dashboard/advanced-fulfillment',
//       icon: 'fa fa-barcode',
//       cycle: '3',
//       container: 'dashboard'
//     },

//     // Settings panel
//     {
//       label: 'Adavanced Fulfillment Settings',
//       route: '/dashboard/advanced-fulfillment',
//       provides: 'settings',
//       container: 'dashboard',
//       template: 'advancedFulfillmentSettings'
//     }
//   ],
//   permissions: [
//     {
//       label: 'Advanced Fulfillment',
//       permission: 'dashboard/advanced-fulfillment',
//       group: 'Shop Settings'
//     }
//   ]
// });
ReactionCore.registerPackage({
  label: 'Advanced Fulfillment',
  name: 'reaction-advanced-fulfillment',
  icon: 'fa fa-barcode',
  autoEnable: true,
  settings: {},
  registry: [{
    route: '/reaction/dashboard/advanced-fulfillment',
    name: 'advancedFulfillment',
    provides: 'dashboard',
    label: 'Advanced Fulfillment',
    description: 'Advanced Order Fulfillment Tracking',
    icon: 'fa fa-barcode',
    container: 'core',
    template: 'fulfillmentOrders',
    workflow: 'coreWorkflow',
    priority: 2
  }],
  layout: [{
    layout: 'coreAdminLayout',
    workflow: 'coreWorkflow',
    theme: 'default',
    enabled: true,
    structure: {
      template: 'fulfillmentOrders',
      layoutHeader: 'layoutHeader',
      layoutFooter: '',
      notFound: 'notFound',
      dashboardHeader: 'dashboardHeader',
      dashboardControls: 'accountsDashboardControls', // TODO: Update this for Rental Products
      dashboardHeaderControls: '',
      adminControlsFooter: 'adminControlsFooter'
    }
  }]
});
