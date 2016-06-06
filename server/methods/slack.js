Meteor.methods({
  'advancedFulfullment/slackMessage': function (orderId) {
    check(orderId, String);
    // TODO : Lock down from client calling method:
    const order = ReactionCore.Collections.Orders.findOne(orderId);
    if (order) {
      let start = moment(order.startTime).format('M/D/YY');
      let end = moment(order.endTime).format('M/D/YY');
      let orderNumber = `Order #${order.orderNumber} items: `;
      let orderLink = `${process.env.ROOT_URL}/dashboard/advanced-fulfillment/order/${order._id}`;
      let orderText = `*Order #${order.orderNumber}* placed by: ${order.billing[0].address.fullName}
        Placed on: ${moment(order.createdAt).format('M/D/YY')}
        Rental Dates: ${start}-${end}
        Contact Email: ${order.email}
        Contact Phone: ${order.billing[0].address.phone}
        Shipping To: ${order.shipping[0].address.city}, ${order.shipping[0].address.region}
        *Order Total: $ ${order.billing[0].invoice.total}*`;
      let slackPost = {
        channel: 'sales',
        text: orderText,
        icon_url: 'https://cdn0.iconfinder.com/data/icons/kameleon-free-pack-rounded/110/Money-Increase-128.png',
        as_user: false,
        username: 'sales_bot',
        mrkdwn: true
      };

      let attachments = {
        title: orderNumber,
        title_link: orderLink,
        color: '#3AA5BE'
      };
      let fields = _.map(order.items, function (item) {
        let field = {
          title: item.variants.sku,
          value: 'Qty:' + item.quantity,
          short: true
        };
        return field;
      });
      attachments.fields = fields;

      Slack.PostMessage(slackPost, [attachments]);
    }
  }
});
