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
    it('should update create a history object on order', function () {
      let Order = Factory.create('orderForAF');
      let User = Factory.create('user');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      expect(Order.history.length).toEqual(0);
      Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, User._id, 'orderCreated');
      expect(ReactionCore.Collections.Orders.findOne(Order._id).history.length).toEqual(1);
    });
  });
});
