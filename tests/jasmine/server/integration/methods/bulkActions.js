beforeAll(function () {
  VelocityHelpers.exportGlobals();
});

describe('getoutfitted:reaction-advanced-fulfillment bulkActions methods', function () {

  describe('advancedFulfillment/shipSelectedOrders', function () {

    beforeEach(function () {
      Meteor.users.remove({});
      return ReactionCore.Collections.Orders.remove({});
    });

    it('should update mulitple orders to ordershipped', function () {
      let Order = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderReadyToShip'
      });
      let Order2 = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderReadyToShip'
      });
      let Order3 = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderReadyToShip'
      });
      const user = Factory.create('user');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      spyOn(Meteor, 'userId').and.returnValue(user._id);
      let orders = [Order, Order2, Order3];
      let allReady = _.every(orders, function (order) {
        return order.advancedFulfillment.workflow.status === 'orderReadyToShip';
      });
      expect(allReady).toBe(true);
      let orderIds = [Order._id, Order2._id, Order3._id];
      Meteor.call('advancedFulfillment/shipSelectedOrders', orderIds);
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderShipped');
      expect(Order.history.length).toBe(1);
      expect(Order.history).toContain(jasmine.objectContaining({event: 'orderShipped'}));
      Order3 = ReactionCore.Collections.Orders.findOne(Order3._id);
      expect(Order3.advancedFulfillment.workflow.status).toBe('orderShipped');
      expect(Order3.history.length).toBe(1);
      expect(Order3.history).toContain(jasmine.objectContaining({event: 'orderShipped'}));
    });

    it('should not update orders not in orderReadyToShip', function () {
      let Order = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderReadyToShip'
      });
      let Order2 = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderReadyToShip'
      });
      let Order3 = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      spyOn(Meteor, 'userId').and.returnValue(user._id);
      let orders = [Order, Order2, Order3];
      let allReady = _.every(orders, function (order) {
        return order.advancedFulfillment.workflow.status === 'orderReadyToShip';
      });
      expect(allReady).toBe(false);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderReadyToShip');
      expect(Order3.advancedFulfillment.workflow.status).toBe('orderCreated');
      let orderIds = [Order._id, Order2._id, Order3._id];
      Meteor.call('advancedFulfillment/shipSelectedOrders', orderIds);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderShipped');
      expect(Order.history.length).toBe(1);
      expect(Order.history).toContain(jasmine.objectContaining({event: 'orderShipped'}));
      Order3 = ReactionCore.Collections.Orders.findOne(Order3._id);
      expect(Order3.advancedFulfillment.workflow.status).toBe('orderCreated');
      expect(Order3.history.length).toBe(0);
    });
  });

  describe('advancedFulfillment/unshipSelectedOrders', function () {

    beforeEach(function () {
      Meteor.users.remove({});
      return ReactionCore.Collections.Orders.remove({});
    });

    it('should revert multiple orders from shipped status', function () {
      let Order = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderShipped'
      });
      let Order2 = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderShipped'
      });
      const user = Factory.create('user');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      spyOn(Meteor, 'userId').and.returnValue(user._id);
      expect(Order.history.length).toBe(0);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderShipped');
      expect(Order2.advancedFulfillment.workflow.status).toBe('orderShipped');
      Meteor.call('advancedFulfillment/unshipSelectedOrders', [Order._id, Order2._id]);
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      Order2 = ReactionCore.Collections.Orders.findOne(Order2._id);
      expect(Order.history.length).toBe(1);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderReadyToShip');
      expect(Order2.advancedFulfillment.workflow.status).toBe('orderReadyToShip');
    });

    it('should not update an order if order is not in orderShipped', function () {
      let Order = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderShipped'
      });
      let Order2 = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderPicked'
      });
      const user = Factory.create('user');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      spyOn(Meteor, 'userId').and.returnValue(user._id);
      expect(Order.history.length).toBe(0);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderShipped');
      expect(Order2.advancedFulfillment.workflow.status).toBe('orderPicked');
      Meteor.call('advancedFulfillment/unshipSelectedOrders', [Order._id, Order2._id]);
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      Order2 = ReactionCore.Collections.Orders.findOne(Order2._id);
      expect(Order.history.length).toBe(1);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderReadyToShip');
      expect(Order2.advancedFulfillment.workflow.status).toBe('orderPicked');
    });
  });

  describe('advancedFulfillment/printSelectedOrders', function () {

    beforeEach(function () {
      Meteor.users.remove({});
      return ReactionCore.Collections.Orders.remove({});
    });

    it('should update mulitple orders to orderPrinter', function () {
      let Order = Factory.create('importedShopifyOrder');
      let Order2 = Factory.create('importedShopifyOrder');
      let Order3 = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      spyOn(Meteor, 'userId').and.returnValue(user._id);
      let orders = [Order, Order2, Order3];
      let allReady = _.every(orders, function (order) {
        return order.advancedFulfillment.workflow.status === 'orderCreated';
      });
      expect(allReady).toBe(true);
      let orderIds = [Order._id, Order2._id, Order3._id];
      Meteor.call('advancedFulfillment/printSelectedOrders', orderIds);
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderPrinted');
      expect(Order.history.length).toBe(1);
      expect(Order.history).toContain(jasmine.objectContaining({event: 'orderPrinted'}));
      Order3 = ReactionCore.Collections.Orders.findOne(Order3._id);
      expect(Order3.advancedFulfillment.workflow.status).toBe('orderPrinted');
      expect(Order3.history.length).toBe(1);
      expect(Order3.history).toContain(jasmine.objectContaining({event: 'orderPrinted'}));
    });

    it('should not update orders not in a different status', function () {
      let Order = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderReadyToShip'
      });
      let Order2 = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderReadyToShip'
      });
      let Order3 = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      spyOn(Meteor, 'userId').and.returnValue(user._id);
      let orders = [Order, Order2, Order3];
      let allReady = _.every(orders, function (order) {
        return order.advancedFulfillment.workflow.status === 'orderReadyToShip';
      });
      expect(allReady).toBe(false);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderReadyToShip');
      expect(Order3.advancedFulfillment.workflow.status).toBe('orderCreated');
      let orderIds = [Order._id, Order2._id, Order3._id];
      Meteor.call('advancedFulfillment/printSelectedOrders', orderIds);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      Order3 = ReactionCore.Collections.Orders.findOne(Order3._id);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderReadyToShip');
      expect(Order.history.length).toBe(0);
      expect(Order3.history).toContain(jasmine.objectContaining({event: 'orderPrinted'}));
      expect(Order3.advancedFulfillment.workflow.status).toBe('orderPrinted');
      expect(Order3.history.length).toBe(1);
    });
  });

  describe('advancedFulfillment/returnSelectedOrders', function () {

    beforeEach(function () {
      Meteor.users.remove({});
      return ReactionCore.Collections.Orders.remove({});
    });

    it('should updated shipped orders to returned', function () {
      let Order = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderShipped'
      });
      let Order2 = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderShipped'
      });
      const user = Factory.create('user');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      spyOn(Meteor, 'userId').and.returnValue(user._id);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderShipped');
      expect(Order2.advancedFulfillment.workflow.status).toBe('orderShipped');
      Meteor.call('advancedFulfillment/returnSelectedOrders', [Order._id, Order2._id]);
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
      expect(ReactionCore.Collections.Orders.update.calls.count()).toBe(4);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      Order2 = ReactionCore.Collections.Orders.findOne(Order2._id);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderReturned');
      expect(Order2.advancedFulfillment.workflow.status).toBe('orderReturned');
    });

    it('should update all items to shipped', function () {
      let Order = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderShipped'
      });
      let Order2 = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderShipped'
      });
      const user = Factory.create('user');
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      spyOn(Meteor, 'userId').and.returnValue(user._id);
      let orderItems = _.every(Order.advancedFulfillment.items, function (item) {
        return item.workflow.status === 'In Stock';
      });
      let order2Items = _.every(Order2.advancedFulfillment.items, function (item) {
        return item.workflow.status === 'In Stock';
      });
      expect(orderItems).toBe(true);
      expect(order2Items).toBe(true);
      Meteor.call('advancedFulfillment/returnSelectedOrders', [Order._id, Order2._id]);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      Order2 = ReactionCore.Collections.Orders.findOne(Order2._id);
      orderItems = _.every(Order.advancedFulfillment.items, function (item) {
        return item.workflow.status === 'shipped';
      });
      order2Items = _.every(Order2.advancedFulfillment.items, function (item) {
        return item.workflow.status === 'shipped';
      });
      expect(orderItems).toBe(true);
      expect(order2Items).toBe(true);
    });

    it('should not update an order that isnt shipped', function () {
      let Order = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderShipped'
      });
      let Order2 = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderPacked'
      });
      const user = Factory.create('user');
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      spyOn(Meteor, 'userId').and.returnValue(user._id);
      let orderItems = _.every(Order.advancedFulfillment.items, function (item) {
        return item.workflow.status === 'In Stock';
      });
      let order2Items = _.every(Order2.advancedFulfillment.items, function (item) {
        return item.workflow.status === 'In Stock';
      });
      expect(Order.advancedFulfillment.workflow.status).toBe('orderShipped');
      expect(Order2.advancedFulfillment.workflow.status).toBe('orderPacked');
      expect(orderItems).toBe(true);
      expect(order2Items).toBe(true);
      Meteor.call('advancedFulfillment/returnSelectedOrders', [Order._id, Order2._id]);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      Order2 = ReactionCore.Collections.Orders.findOne(Order2._id);
      orderItems = _.every(Order.advancedFulfillment.items, function (item) {
        return item.workflow.status === 'shipped';
      });
      order2Items = _.every(Order2.advancedFulfillment.items, function (item) {
        return item.workflow.status === 'shipped';
      });
      expect(Order.advancedFulfillment.workflow.status).toBe('orderReturned');
      expect(Order2.advancedFulfillment.workflow.status).toBe('orderPacked');
      expect(orderItems).toBe(true);
      expect(order2Items).toBe(false);
    });
  });

  describe('advancedFulfillment/completeSelectedOrders', function () {

    beforeEach(function () {
      Meteor.users.remove({});
      return ReactionCore.Collections.Orders.remove({});
    });

    it('should update mulitple orders to complete', function () {
      let Order = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderShipped'
      });
      let Order2 = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderShipped'
      });
      let Order3 = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderReturned'
      });
      const user = Factory.create('user');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      spyOn(Meteor, 'userId').and.returnValue(user._id);
      let orders = [Order, Order2, Order3];
      let allReady = _.every(orders, function (order) {
        return order.advancedFulfillment.workflow.status === 'orderShipped' || order.advancedFulfillment.workflow.status === 'orderReturned';
      });
      expect(allReady).toBe(true);
      let orderIds = [Order._id, Order2._id, Order3._id];
      Meteor.call('advancedFulfillment/completeSelectedOrders', orderIds);
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderCompleted');
      expect(Order.history.length).toBe(2);
      expect(Order.history).toContain(jasmine.objectContaining({event: 'orderCompleted'}));
      Order3 = ReactionCore.Collections.Orders.findOne(Order3._id);
      expect(Order3.advancedFulfillment.workflow.status).toBe('orderCompleted');
      expect(Order3.history.length).toBe(2);
      expect(Order3.history).toContain(jasmine.objectContaining({event: 'orderCompleted'}));
    });

    it('should not update orders not in orderShipped or orderReturned', function () {
      let Order = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderShipped'
      });
      let Order2 = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderReturned'
      });
      let Order3 = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      spyOn(Meteor, 'userId').and.returnValue(user._id);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderShipped');
      expect(Order2.advancedFulfillment.workflow.status).toBe('orderReturned');
      expect(Order3.advancedFulfillment.workflow.status).toBe('orderCreated');
      let orderIds = [Order._id, Order2._id, Order3._id];
      Meteor.call('advancedFulfillment/completeSelectedOrders', orderIds);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderCompleted');
      expect(Order.history.length).toBe(2);
      expect(Order.history).toContain(jasmine.objectContaining({event: 'orderCompleted'}));
      Order2 = ReactionCore.Collections.Orders.findOne(Order2._id);
      expect(Order2.advancedFulfillment.workflow.status).toBe('orderCompleted');
      expect(Order2.history.length).toBe(2);
      expect(Order2.history).toContain(jasmine.objectContaining({event: 'orderCompleted'}));
      Order3 = ReactionCore.Collections.Orders.findOne(Order3._id);
      expect(Order3.advancedFulfillment.workflow.status).toBe('orderCreated');
      expect(Order3.history.length).toBe(0);
    });
  });
});
