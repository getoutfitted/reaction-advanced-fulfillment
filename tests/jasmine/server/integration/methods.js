describe('getoutfitted:reaction-advanced-fulfillment methods', function () {
  describe('advancedFulfillment/updateOrderWorkflow', function () {
    beforeEach(function () {
      return ReactionCore.Collections.Orders.remove({});
    });
    it('should update the orderWorkflow', function () {
      let Order = Factory.create('orderForAF');
      spyOn(ReactionCore.Collections.Orders, 'update');
      expect(Order.advancedFulfillment).toBeDefined();
      expect(Order.advancedFulfillment.workflow.status).toEqual('new');
    });
  });
});
