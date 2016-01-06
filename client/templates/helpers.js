Template.registerHelper('displayOrderNumber', (order) => {
  if (order.shopifyOrderId) {
    return '<a href="http://getoutfitted.myshopify.com/admin/orders/'
    + order.shopifyOrderId
    + '">Order #' + order.shopifyOrderNumber + '</a>';
  } else if (order.shopifyOrderNumber) {
    return 'Order #' + order.shopifyOrderNumber;
  }

  // Default
  return 'Order #' + order._id;
});

Template.registerHelper('formattedDate', (date) => {
  return moment(date).calendar(null, AdvancedFulfillment.shippingCalendarReference);
});
