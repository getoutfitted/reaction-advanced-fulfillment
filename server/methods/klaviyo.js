Meteor.methods({
  'advancedFulfillment/klaviyoEnabled': function (orderId, eventName, methodName) {
    check(orderId, String);
    check(eventName, String);
    check(methodName, String);
    const afPackage = ReactionCore.Collections.Packages.findOne({
      name: 'reaction-advanced-fulfillment',
      shopId: ReactionCore.getShopId()
    });
    const order = ReactionCore.Collections.Orders.findOne(orderId);
    if (afPackage.settings && afPackage.settings.klaviyo && order.email) {
      Meteor.call(methodName, order._id, eventName);
    }
  },
  'advancedFulfullment/createKlaviyoItemEvents': function (orderId, eventName) {
    check(orderId, String);
    check(eventName, String);
    const order = ReactionCore.Collections.Orders.findOne(orderId);
    const billing = order.billing[0].address;
    let fullName = billing.fullName;
    let names = fullName.split(' ');
    let firstName = names[0];
    const address = billing.address2 ? `${billing.address1} ${billing.address2}` : billing.address1;
    const shipping = order.shipping[0].address;
    const shippingAddressInfo = shipping.address2 ? `${shipping.address1} ${shipping.address2}` : shipping.address1;
    let klaviyo = {
      'customer_properties': {
        '$email': order.email,
        '$first_name': firstName,
        'Full Name': billing.fullName,
        'Address': address,
        '$phone_number': billing.phone,
        '$city': billing.city,
        '$region': billing.region,
        '$zip': billing.postal,
        '$country': billing.country
      },
      'properties': {
        'Order Number': order.orderNumber,
        'Shipping Address': shippingAddressInfo,
        'Shipping City': order.shipping[0].address.city,
        'Shipping State': order.shipping[0].address.region,
        'Shipping Country': order.shipping[0].address.country,
        'Shipping Zipcode': order.shipping[0].address.postal,
        'Arrival Day': moment(order.advancedFulfillment.arriveBy).format('MMMM D, YYYY'),
        'Customer Return Date': moment(order.advancedFulfillment.shipReturnBy).format('MMMM D, YYYY'),
        'Shipment Date': moment(order.advancedFulfillment.shipmentDate).format('MMMM D, YYYY'),
        'Return To GO By Date': moment(order.advancedFulfillment.returnDate).format('MMMM D, YYYY')
      }
    };
    if (names.length > 1) {
      names.shift();
      klaviyo.customer_properties['$last_name'] = names.join(' ');
    }
    _.each(order.items, function (item) {
      let klaviyoItem = _.clone(klaviyo);
      let product = ReactionCore.Collections.Products.findOne(item.productId);
      if (product) {
        let props = klaviyoItem.properties;
        props.gender = product.gender;
        props['Product Type'] = product.productType;
        props.name = product.title;
        props['Page Title'] = product.pageTitle;
        props.vendor = product.vendor;
        props.type = product.functionalType;
        props.color = item.variants.color;
        props.size = item.variants.size;
        if (item.variants.functionalType === 'variant') {
          props.rental = false;
          props.$value = item.variants.price;
        } else {
          props.rental = true;
          props.$value = item.variants.pricePerDay * order.rentalDays;
        }
        props['Price Per Day'] = item.variants.pricePerDay;
        props.price = item.variants.price;
        props.quantity = item.quantity;
        props['Rental Length in Days'] = order.rentalDays;
        klaviyoItem['event'] = `${eventName} - ${product.pageTitle}`;
        Klaviyo.trackEvent(klaviyoItem);
        ReactionCore.Log.info(`Klaviyo Ordered Product Event Processed for ${order.orderNumber}`);
      }
    });
  },
  'advancedFulfullment/createKlaviyoGeneralEvent': function (orderId, eventName) {
    check(orderId, String);
    check(eventName, String);
    const order = ReactionCore.Collections.Orders.findOne(orderId);
    if (order) {
      const billing = order.billing[0].address;
      let fullName = billing.fullName;
      let names = fullName.split(' ');
      let firstName = names[0];
      const address = billing.address2 ? `${billing.address1} ${billing.address2}` : billing.address1;
      const shipping = order.shipping[0].address;
      const shippingAddressInfo = shipping.address2 ? `${shipping.address1} ${shipping.address2}` : shipping.address1;
      let productIds = [];
      let productDescriptions = [];
      let skus = [];
      _.each(order.advancedFulfillment.items, function (item) {
        productIds.push(item.productId);
        let description = item.itemDescription || item.title;
        productDescriptions.push(description);
        skus.push(item.sku);
      });
      let klaviyo = {
        'event': eventName,
        'customer_properties': {
          '$email': order.email,
          '$first_name': firstName,
          'Full Name': billing.fullName,
          'Address': address,
          '$phone_number': billing.phone,
          '$city': billing.city,
          '$region': billing.region,
          '$zip': billing.postal,
          '$country': billing.country
        },
        'properties': {
          'Order Number': order.orderNumber,
          '$value': order.billing[0].invoice.total,
          'Taxes': order.billing[0].invoice.taxes,
          'Discount': order.billing[0].invoice.discounts,
          'Subtotal': order.billing[0].invoice.subtotal,
          'Shipping Address': shippingAddressInfo,
          'Shipping City': order.shipping[0].address.city,
          'Shipping State': order.shipping[0].address.region,
          'Shipping Country': order.shipping[0].address.country,
          'Shipping Zipcode': order.shipping[0].address.postal,
          'Arrival Day': moment(order.advancedFulfillment.arriveBy).format('MMMM D, YYYY'),
          'Customer Return Date': moment(order.advancedFulfillment.shipReturnBy).format('MMMM D, YYYY'),
          'Product Descriptions': productDescriptions,
          'Product Ids': productIds,
          'Product Skus': skus,
          'Shipment Date': moment(order.advancedFulfillment.shipmentDate).format('MMMM D, YYYY'),
          'Return To GO By Date': moment(order.advancedFulfillment.returnDate).format('MMMM D, YYYY'),
          'Rental Length in Days': order.rentalDays
        }
      };
      if (names.length > 1) {
        names.shift();
        klaviyo.customer_properties['$last_name'] = names.join(' ');
      }
      Klaviyo.trackEvent(klaviyo);
      ReactionCore.Log.info(`Klaviyo ${eventName} Event Processed for ${order.orderNumber}`);
      if (eventName === 'Checkout') {
        Meteor.call('advancedFulfullment/createKlaviyoItemEvents', orderId, 'Ordered Product');
      }
    }
  }
});
