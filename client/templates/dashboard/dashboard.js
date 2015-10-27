Template.dashboardAdvancedFulfillmment.helpers({
  dateToday: function () {
    return moment().format('MM-DD-YYYY');
  }
});

Template.dashboardAdvancedFulfillmment.onRendered(function () {
  let width = 960,
      height = 500,
      radius = Math.min(width, height) / 2 - 10;
  let rawDate = new Date();
  let dayStart = moment(rawDate).startOf('day')._d;
  let dayEnd = moment(rawDate).endOf('day')._d;
  let orderCreated = ReactionCore.Collections.Orders.find({
    'advancedFulfillment.shipmentDate': {
      $gte: new Date(dayStart),
      $lte: new Date(dayEnd)
    },
    'advancedFulfillment.workflow.status': 'orderCreated'
  }).count();
  let orderPicking = ReactionCore.Collections.Orders.find({
    'advancedFulfillment.shipmentDate': {
      $gte: new Date(dayStart),
      $lte: new Date(dayEnd)
    },
    'advancedFulfillment.workflow.status': 'orderPicking'
  }).count();
  let orderPacking = ReactionCore.Collections.Orders.find({
    'advancedFulfillment.shipmentDate': {
      $gte: new Date(dayStart),
      $lte: new Date(dayEnd)
    },
    'advancedFulfillment.workflow.status': 'orderPacking'
  }).count();
  let orderFulfilled = ReactionCore.Collections.Orders.find({
    'advancedFulfillment.shipmentDate': {
      $gte: new Date(dayStart),
      $lte: new Date(dayEnd)
    },
    'advancedFulfillment.workflow.status': 'orderFulfilled'
  }).count();
  let data = [orderCreated, orderPicking, orderPacking, orderFulfilled];


  let color = d3.scale.category10();

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
