Template.dashboardAdvancedFulfillmment.onRendered(function () {
  $('#print-date').datepicker();
});

Template.dashboardAdvancedFulfillmment.helpers({
  chosenDate: function () {
    Session.setDefault('chosenDate', moment().format('MM/DD/YYYY'));
    return Session.get('chosenDate');
  },
  chosenDateText: function () {
    return moment(Session.get('chosenDate'), 'MM/DD/YYYY').calendar(null, AdvancedFulfillment.calendarReferenceTime);
  },
  todaysOrdersExist: function () {
    let rawDate = new Date();
    let dayStart = moment(rawDate).startOf('day')._d;
    let dayEnd = moment(rawDate).endOf('day')._d;
    let allOfTodaysOrders = ReactionCore.Collections.Orders.find({
      $or: [{
        'advancedFulfillment.workflow.status': 'orderCreated'
      }, {
        'advancedFulfillment.workflow.status': 'orderPicking'
      }, {
        'advancedFulfillment.workflow.status': 'orderPacking'
      }, {
        'advancedFulfillment.workflow.status': 'orderFulfilled'
      }, {
        'advancedFulfillment.workflow.status': 'orderShipping'
      }],
      'advancedFulfillment.shipmentDate': {
        $gte: new Date(dayStart),
        $lte: new Date(dayEnd)
      }
    }).count();
    if (allOfTodaysOrders > 0) {
      return true;
    }
    return false;
  }
});

Template.dashboardAdvancedFulfillmment.events({
  'blur #print-date': function (event) {
    let date = event.currentTarget.value;
    Session.set('chosenDate', date);
  },
  // 'click .print-all-todays': function (event) {
  //   event.preventDefault();
  //   let date = event.target.dataset.todaysDate;
  //   let startDate = new Date(date);
  //   let endDate = moment(startDate).endOf('day').toDate();
  //   Meteor.call('advancedFulfillment/printInvoices', startDate, endDate, Meteor.userId());
  //   Router.go('orders.printAllForDate', {date: date});
  // },
  'click .print-specific-date': function (event) {
    event.preventDefault();
    let chosenDate = Session.get('chosenDate');
    let date = moment(chosenDate, 'MM-DD-YYYY');
    if (date.isValid()) {
      Meteor.call('advancedFulfillment/printInvoices', date.startOf('day').toDate(), date.endOf('day').toDate(), Meteor.userId());
      Router.go('orders.printAllForDate', {date: date.format('MM-DD-YYYY')});
    } else {
      Alerts.removeSeen();
      Alerts.add('please select a valid date', 'danger', {
        autoHide: true
      });
    }
  }
});

Template.dashboardAdvancedFulfillmment.onRendered(function () {
  let width = 960,
      height = 500,
      radius = Math.min(width, height) / 2 - 10;
  let rawDate = new Date();
  let dayStart = moment(rawDate).startOf('day')._d;
  let dayEnd = moment(rawDate).endOf('day')._d;
  let allOfTodaysOrders = ReactionCore.Collections.Orders.find({
    $or: [{
      'advancedFulfillment.workflow.status': 'orderCreated'
    }, {
      'advancedFulfillment.workflow.status': 'orderPicking'
    }, {
      'advancedFulfillment.workflow.status': 'orderPacking'
    }, {
      'advancedFulfillment.workflow.status': 'orderFulfilled'
    }, {
      'advancedFulfillment.workflow.status': 'orderShipping'
    }],
    'advancedFulfillment.shipmentDate': {
      $gte: new Date(dayStart),
      $lte: new Date(dayEnd)
    }
  }).fetch();

  let orderByStatus = _.countBy(allOfTodaysOrders, function (order) {
    return order.advancedFulfillment.workflow.status;
  });

  let data = [
    orderByStatus.orderCreated || 0,
    orderByStatus.orderPicking || 0,
    orderByStatus.orderPacking || 0,
    orderByStatus.orderFulfilled || 0,
    orderByStatus.orderShipping || 0
  ];


  // let color = d3.scale.category10();
  let color = d3.scale.ordinal()
  .range(['#000000', '#EE4043', '#FABA61', '#FDF6AF', '#429544']);
  let arc = d3.svg.arc()
      .outerRadius(radius);

  let pie = d3.layout.pie();

  let svg = d3.select('.d3').append('svg')
      .datum(data)
      .attr('width', width)
      .attr('height', height)
    .append('g')
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

  let arcs = svg.selectAll('g.arc')
      .data(pie)
    .enter().append('g')
      .attr('class', 'arc');

  arcs.append('path')
      .attr('fill', function(d, i) { return color(i); })
    .transition()
      .ease('bounce')
      .duration(2000)
      .attrTween('d', tweenPie)
    .transition()
      .ease('elastic')
      .delay(function(d, i) { return 2000 + i * 50; })
      .duration(750)
      .attrTween('d', tweenDonut);

  function tweenPie(b) {
    b.innerRadius = 0;
    let i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
    return function(t) { return arc(i(t)); };
  }

  function tweenDonut(b) {
    b.innerRadius = radius * .6;
    let i = d3.interpolate({innerRadius: 0}, b);
    return function(t) { return arc(i(t)); };
  }
})
