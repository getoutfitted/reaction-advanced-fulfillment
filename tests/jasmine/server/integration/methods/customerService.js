beforeAll(function () {
  VelocityHelpers.exportGlobals();
});

fdescribe('getoutfitted:reaction-advanced-fulfillment customerService methods', function () {
  describe('advancedFulfillment/cancelOrder', function () {
    beforeEach(function () {
      Meteor.users.remove({});
      return ReactionCore.Collections.Orders.remove({});
    });
    it('should cancel a single order', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      expect(Order.advancedFulfillment.workflow.status).toBe('orderCreated');
      expect(Order.history.length).toBe(0);
      expect(Order.orderNotes).toBe(undefined);
      Meteor.call('advancedFulfillment/cancelOrder', Order._id, user._id);
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderCancelled');
      expect(Order.history.length).toBe(1);
      expect(Order.history).toContain(jasmine.objectContaining({event: 'orderCancelled'}));
      expect(Order.history).toContain(jasmine.objectContaining({userId: user._id}));
      expect(Order.orderNotes).toMatch('Order Cancelled');
      expect(Order.orderNotes).toMatch(user.username);
    });
    it('should log as a guest if user is not found', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      expect(Order.history.length).toBe(0);
      expect(Order.orderNotes).toBe(undefined);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderCreated');
      Meteor.call('advancedFulfillment/cancelOrder', Order._id, 'Random User');
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderCancelled');
      expect(Order.history.length).toBe(1);
      expect(Order.history).toContain(jasmine.objectContaining({event: 'orderCancelled'}));
      expect(Order.history).not.toContain(jasmine.objectContaining({userId: user._id}));
      expect(Order.history).toContain(jasmine.objectContaining({userId: 'Random User'}));
      expect(Order.orderNotes).toMatch('Guest');
      expect(Order.orderNotes).not.toMatch(user.username);
    });
  });
  describe('advancedFulfillment/bundleColorConfirmation', function () {
    beforeEach(function () {
      Meteor.users.remove({});
      return ReactionCore.Collections.Orders.remove({});
    });
    it('should mark bundle missing as false', function () {
      let Order = Factory.create('importedShopifyOrder', {
        bundleMissingColor: true
      });
      const user = Factory.create('user');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      expect(Order.history.length).toBe(0);
      expect(Order.bundleMissingColor).toBe(true);
      Meteor.call('advancedFulfillment/bundleColorConfirmation', Order._id, user._id);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.bundleMissingColor).toBe(false);
      expect(Order.history.length).toBe(1);
      expect(Order.history).toContain(jasmine.objectContaining({event: 'bundleColorConfirmed'}));
      expect(Order.history).toContain(jasmine.objectContaining({userId: user._id}));
    });
  });
});
