describe('getoutfitted:reaction-advanced-fulfillment methods', function () {
  describe('advancedFulfillment/updateOrderWorkflow', function () {
    beforeEach(function () {
      return ReactionCore.Collections.Orders.remove({});
    });
    it('should initially have a new workflow status', function () {
      let Order = Factory.create('orderForAF');
      expect(Order.advancedFulfillment).toBeDefined();
      expect(Order.advancedFulfillment.workflow.status).toEqual('new');
    });
    it('should not have any history events', function () {
      let Order = Factory.create('orderForAF');
      expect(Order.history.length).toEqual(0);
    });
    it('should update Order after being called', function () {
      let Order = Factory.create('orderForAF');
      let User = Factory.create('user');
      spyOn(ReactionCore.Collections.Orders, 'update');
      Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, User._id, 'orderCreated');
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
    });
    it('should update create a history object on order with correct event and userID', function () {
      let Order = Factory.create('orderForAF');
      let User = Factory.create('user');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      expect(Order.history.length).toEqual(0);
      Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, User._id, 'orderCreated');
      let thisOrder = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(thisOrder.history.length).toEqual(1);
      expect(thisOrder.history[0].event).toEqual('orderPicking');
      expect(thisOrder.history[0].userId).toEqual(User._id);
    });
    it('should update the advancedFulfillment workflow', function () {
      let Order = Factory.create('orderForAF');
      let User = Factory.create('user');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, User._id, 'orderCreated');
      let thisOrder = ReactionCore.Collections.Orders.findOne(Order._id).advancedFulfillment;
      expect(thisOrder.workflow.status).toEqual('orderPicking');
      expect(thisOrder.workflow.workflow.length).toEqual(1);
      expect(thisOrder.workflow.workflow).toContain('orderCreated');
    });
    it('should throw an error if not passed a valid orderid', function () {
      let User = Factory.create('user');
      let Order = Factory.create('orderForAF');
      spyOn(ReactionCore.Collections.Orders, 'update');
      expect(function () {
        return Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, User._id, 'orderCreated');
      }).not.toThrow();
      expect(function () {
        return Meteor.call('advancedFulfillment/updateOrderWorkflow', 1234, User._id, 'orderCreated');
      }).toThrow();
    });
    it('should throw an error if not passed a valid userid', function () {
      let User = Factory.create('user');
      let Order = Factory.create('orderForAF');
      spyOn(ReactionCore.Collections.Orders, 'update');
      expect(function () {
        return Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, User._id, 'orderCreated');
      }).not.toThrow();
      expect(function () {
        return Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, true, 'orderCreated');
      }).toThrow();
    });
    it('should throw an error if not passed a valid status', function () {
      let User = Factory.create('user');
      let Order = Factory.create('orderForAF');
      spyOn(ReactionCore.Collections.Orders, 'update');
      expect(function () {
        return Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, User._id, 'orderCreated');
      }).not.toThrow();
      expect(function () {
        return Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, User._id, true);
      }).toThrow();
    });
    it('should be able to be called multiple times and update the history and work flow', function () {
      let User = Factory.create('user');
      let Order = Factory.create('orderForAF');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, User._id, 'orderCreated');
      let thisOrder = ReactionCore.Collections.Orders.findOne(Order._id);
      Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, User._id, thisOrder.advancedFulfillment.workflow.status);
      thisOrder = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(thisOrder.history.length).toBe(2);
      expect(thisOrder.advancedFulfillment.workflow.workflow.length).toBe(2);
      expect(thisOrder.advancedFulfillment.workflow.status).toBe('orderPacking');
    });
  });
});
