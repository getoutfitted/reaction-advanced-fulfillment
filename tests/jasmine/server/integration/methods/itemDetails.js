beforeAll(function () {
  VelocityHelpers.exportGlobals();
});

describe('getoutfitted:reaction-advanced-fulfillment itemDetails methods', function () {

  describe('advancedFulfillment/updateItemWorkflow', function () {

    beforeEach(function () {
      return ReactionCore.Collections.Orders.remove({});
    });

    it('should update a single item a single step', function () {
      let Order = Factory.create('importedShopifyOrder');
      let item = Order.advancedFulfillment.items[0];
      let item2 = Order.advancedFulfillment.items[1];
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      expect(item.workflow.status).toBe('In Stock');
      expect(item2.workflow.status).toBe('In Stock');
      Meteor.call('advancedFulfillment/updateItemWorkflow', Order._id, item._id, item.workflow.status);
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      item = Order.advancedFulfillment.items[0];
      item2 = Order.advancedFulfillment.items[1];
      expect(item.workflow.status).not.toBe('In Stock');
      expect(item.workflow.status).toBe('picked');
      expect(item2.workflow.status).toBe('In Stock');
    });

    it('should update an items workflow history', function () {
      let Order = Factory.create('importedShopifyOrder');
      let item = Order.advancedFulfillment.items[0];
      let item2 = Order.advancedFulfillment.items[1];
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      expect(item.workflow.workflow.length).toBe(0);
      expect(item.workflow.workflow).not.toContain('In Stock');
      expect(item2.workflow.workflow.length).toBe(0);
      expect(item2.workflow.workflow).not.toContain('In Stock');
      Meteor.call('advancedFulfillment/updateItemWorkflow', Order._id, item._id, item.workflow.status);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      item = Order.advancedFulfillment.items[0];
      item2 = Order.advancedFulfillment.items[1];
      expect(item.workflow.workflow.length).toBe(1);
      expect(item.workflow.workflow).toContain('In Stock');
      expect(item2.workflow.workflow.length).not.toBe(1);
      expect(item2.workflow.workflow).not.toContain('In Stock');
    });

    it('should update an item multiple times all the way through completed', function () {
      let Order = Factory.create('importedShopifyOrder');
      let item = Order.advancedFulfillment.items[0];
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      expect(item.workflow.workflow.length).toBe(0);
      expect(item.workflow.status).toBe('In Stock');
      expect(item.workflow.workflow).not.toContain('In Stock');
      Meteor.call('advancedFulfillment/updateItemWorkflow', Order._id, item._id, item.workflow.status);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      item = Order.advancedFulfillment.items[0];
      expect(item.workflow.workflow.length).toBe(1);
      expect(item.workflow.status).toBe('picked');
      expect(item.workflow.workflow).toContain('In Stock');
      Meteor.call('advancedFulfillment/updateItemWorkflow', Order._id, item._id, item.workflow.status);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      item = Order.advancedFulfillment.items[0];
      expect(item.workflow.workflow.length).toBe(2);
      expect(item.workflow.status).toBe('packed');
      expect(item.workflow.workflow).toContain('In Stock');
      expect(item.workflow.workflow).toContain('picked');
      Meteor.call('advancedFulfillment/updateItemWorkflow', Order._id, item._id, item.workflow.status);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      item = Order.advancedFulfillment.items[0];
      expect(item.workflow.workflow.length).toBe(3);
      expect(item.workflow.status).toBe('shipped');
      expect(item.workflow.workflow).toContain('In Stock');
      expect(item.workflow.workflow).toContain('picked');
      expect(item.workflow.workflow).toContain('packed');
      Meteor.call('advancedFulfillment/updateItemWorkflow', Order._id, item._id, item.workflow.status);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      item = Order.advancedFulfillment.items[0];
      expect(item.workflow.workflow.length).toBe(4);
      expect(item.workflow.status).toBe('returned');
      expect(item.workflow.workflow).toContain('In Stock');
      expect(item.workflow.workflow).toContain('picked');
      expect(item.workflow.workflow).toContain('packed');
      expect(item.workflow.workflow).toContain('shipped');
      Meteor.call('advancedFulfillment/updateItemWorkflow', Order._id, item._id, item.workflow.status);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      item = Order.advancedFulfillment.items[0];
      expect(item.workflow.workflow.length).toBe(5);
      expect(item.workflow.status).toBe('completed');
      expect(item.workflow.workflow).toContain('In Stock');
      expect(item.workflow.workflow).toContain('picked');
      expect(item.workflow.workflow).toContain('packed');
      expect(item.workflow.workflow).toContain('shipped');
      expect(item.workflow.workflow).toContain('returned');
    });

    it('should update a single item that isnt first item', function () {
      let Order = Factory.create('importedShopifyOrder');
      let item = Order.advancedFulfillment.items[0];
      let item2 = Order.advancedFulfillment.items[1];
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      expect(item.workflow.status).toBe('In Stock');
      expect(item2.workflow.status).toBe('In Stock');
      Meteor.call('advancedFulfillment/updateItemWorkflow', Order._id, item2._id, item2.workflow.status);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      item = Order.advancedFulfillment.items[0];
      item2 = Order.advancedFulfillment.items[1];
      expect(item2.workflow.status).not.toBe('In Stock');
      expect(item2.workflow.status).toBe('picked');
      expect(item.workflow.status).toBe('In Stock');
    });
  });

  describe('advancedFulfillment/updateAllItems', function () {

    beforeEach(function () {
      return ReactionCore.Collections.Orders.remove({});
    });

    it('should update all items in an order', function () {
      let Order = Factory.create('importedShopifyOrder');
      let itemWorkflowStatusUpdated = _.every(Order.advancedFulfillment.items, function (item) {
        return item.workflow.status === 'In Stock';
      });
      expect(itemWorkflowStatusUpdated).toBe(true);
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      Meteor.call('advancedFulfillment/updateAllItems', Order, 'In Stock');
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      itemWorkflowStatusUpdated = _.every(Order.advancedFulfillment.items, function (item) {
        return item.workflow.status === 'picked';
      });
      expect(itemWorkflowStatusUpdated).toBe(true);
    });

    it('should update all items workflow ', function () {
      let Order = Factory.create('importedShopifyOrder');
      let itemWorkflowLength = _.every(Order.advancedFulfillment.items, function (item) {
        return item.workflow.workflow.length === 0;
      });
      expect(itemWorkflowLength).toBe(true);
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      Meteor.call('advancedFulfillment/updateAllItems', Order, 'In Stock');
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      itemWorkflowLength = _.every(Order.advancedFulfillment.items, function (item) {
        return item.workflow.workflow.length === 1;
      });
      expect(itemWorkflowLength).toBe(true);
      let addedToItemWorkflow = _.every(Order.advancedFulfillment.items, function (item) {
        return _.contains(item.workflow.workflow, 'In Stock');
      });
      expect(addedToItemWorkflow).toBe(true);
    });

    it('can update all items multiple times', function () {
      let Order = Factory.create('importedShopifyOrder');
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      let itemWorkflowStatusUpdated = _.every(Order.advancedFulfillment.items, function (item) {
        return item.workflow.status === 'In Stock';
      });
      expect(itemWorkflowStatusUpdated).toBe(true);
      function itemUpdater(order, itemStatus) {
        Meteor.call('advancedFulfillment/updateAllItems', order, itemStatus);
      }
      itemUpdater(Order, Order.advancedFulfillment.items[0].workflow.status);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      itemWorkflowStatusUpdated = _.every(Order.advancedFulfillment.items, function (item) {
        return item.workflow.status === 'picked';
      });
      expect(itemWorkflowStatusUpdated).toBe(true);
      itemUpdater(Order, Order.advancedFulfillment.items[0].workflow.status);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      itemWorkflowStatusUpdated = _.every(Order.advancedFulfillment.items, function (item) {
        return item.workflow.status === 'packed';
      });
      expect(itemWorkflowStatusUpdated).toBe(true);
    });
  });

  describe('advancedFulfillment/itemIssue', function () {

    beforeEach(function () {
      Meteor.users.remove({});
      return ReactionCore.Collections.Orders.remove({});
    });

    it('should make an item have an issue status', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      let item = Order.advancedFulfillment.items[0];
      let item2 = Order.advancedFulfillment.items[1];
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      expect(item.workflow.status).toBe('In Stock');
      expect(item.workflow.workflow.length).toBe(0);
      expect(item2.workflow.status).toBe('In Stock');
      Meteor.call('advancedFulfillment/itemIssue', Order._id, item._id, user._id, 'Missing');
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      item = Order.advancedFulfillment.items[0];
      item2 = Order.advancedFulfillment.items[1];
      expect(item.workflow.status).toBe('Missing');
      expect(item.workflow.workflow.length).toBe(1);
      expect(item.workflow.workflow).toContain('Missing');
      expect(item2.workflow.status).toBe('In Stock');
    });

    it('should add a history object for issue', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      let item = Order.advancedFulfillment.items[0];
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      expect(Order.history.length).toBe(0);
      Meteor.call('advancedFulfillment/itemIssue', Order._id, item._id, user._id, 'Missing');
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.history.length).toBe(1);
      expect(Order.history).toContain(jasmine.objectContaining({event: 'MissingItem'}));
      expect(Order.history).toContain(jasmine.objectContaining({userId: user._id}));
    });
  });

  describe('advancedFulfillment/itemResolved', function () {

    beforeEach(function () {
      return ReactionCore.Collections.Orders.remove({});
    });

    it('should mark an item as returned', function () {
      let Order = Factory.create('importedShopifyOrder');
      let item = Order.advancedFulfillment.items[0];
      expect(item.workflow.status).toBe('In Stock');
      expect(item.workflow.workflow).not.toContain('Missing');
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      Meteor.call('advancedFulfillment/itemResolved', Order._id, item._id, 'Missing');
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      item = Order.advancedFulfillment.items[0];
      expect(item.workflow.status).toBe('returned');
      expect(item.workflow.workflow).toContain('Missing');
    });
  });

  describe('advancedFulfillment/updateAllItemsToSpecificStatus', function () {

    beforeEach(function () {
      return ReactionCore.Collections.Orders.remove({});
    });

    it('should update all items to any status', function () {
      let Order = Factory.create('importedShopifyOrder');
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      let allItemsStatus = _.every(Order.advancedFulfillment.items, function (item) {
        return item.workflow.status === 'In Stock';
      });
      expect(allItemsStatus).toBe(true);
      Meteor.call('advancedFulfillment/updateAllItemsToSpecificStatus', Order, 'shipped');
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      allItemsStatus = _.every(Order.advancedFulfillment.items, function (item) {
        return item.workflow.status === 'shipped';
      });
      expect(allItemsStatus).toBe(true);
    });
  });
});
