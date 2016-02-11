beforeAll(function () {
  VelocityHelpers.exportGlobals();
});

describe('getoutfitted:reaction-advanced-fulfillment customerService methods', function () {
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
  describe('advancedFulfillment/updateSkiPackageWithCustomerInfo', function () {
    beforeEach(function () {
      Meteor.users.remove({});
      return ReactionCore.Collections.Orders.remove({});
    });
    it('should add ski details to order', function () {
      let skiPackage =  {
        _id: 'bSeX6iLWNfDW3oyT8',
        vendor: 'Black Tie',
        packageName: 'Performance Ski Package | Breckenridge, CO - 3 / With Helmet',
        variantTitle: '3 / With Helmet',
        helmet: true,
        rentalLength: 3,
        qty: 1,
        price: 156.54,
        customerName: 'ACupelo',
        gender: 'Male',
        height: '5 ft 7 in',
        weight: '145 lbs'
      };
      let Order = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.skiPackagesPurchased': true,
        'advancedFulfillment.skiPackages': [skiPackage]
      });
      const user = Factory.create('user');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      let ski = Order.advancedFulfillment.skiPackages;
      expect(ski).toContain(jasmine.objectContaining(skiPackage));
      expect(ski.length).toBe(1);
      expect(ski[0].age).toBe(undefined);
      expect(ski[0].shoeSize).toBe(undefined);
      expect(ski[0].skiLevel).toBe(undefined);
      expect(ski[0].contactCustomer).toBe(undefined);
      Meteor.call('advancedFulfillment/updateSkiPackageWithCustomerInfo', Order._id, user._id, ski[0]._id, 30, '11', 'yellow-intermediate');
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      ski = Order.advancedFulfillment.skiPackages;
      expect(ski).toContain(jasmine.objectContaining(skiPackage));
      expect(ski.length).toBe(1);
      expect(ski[0].age).toBe(30);
      expect(ski[0].shoeSize).toBe('11');
      expect(ski[0].skiLevel).toBe('yellow-intermediate');
      expect(ski[0].contactedCustomer).toBe(true);
    });
    it('should add a history object', function () {
      let skiPackage =  {
        _id: 'bSeX6iLWNfDW3oyT8',
        vendor: 'Black Tie',
        packageName: 'Performance Ski Package | Breckenridge, CO - 3 / With Helmet',
        variantTitle: '3 / With Helmet',
        helmet: true,
        rentalLength: 3,
        qty: 1,
        price: 156.54,
        customerName: 'ACupelo',
        gender: 'Male',
        height: '5 ft 7 in',
        weight: '145 lbs'
      };
      let Order = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.skiPackagesPurchased': true,
        'advancedFulfillment.skiPackages': [skiPackage]
      });
      const user = Factory.create('user');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      let ski = Order.advancedFulfillment.skiPackages;
      expect(Order.history.length).toBe(0);
      Meteor.call('advancedFulfillment/updateSkiPackageWithCustomerInfo', Order._id, user._id, ski[0]._id, 30, '11', 'yellow-intermediate');
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.history.length).toBe(1);
      expect(Order.history).toContain(jasmine.objectContaining({event: 'updatedSkiInfoFromCustomer'}));
      expect(Order.history).toContain(jasmine.objectContaining({userId: user._id}));
    });
  });
  describe('advancedFulfillment/nonWarehouseOrder', function () {
    beforeEach(function () {
      Meteor.users.remove({});
      return ReactionCore.Collections.Orders.remove({});
    });
    it('should update order status to nonWarehouseOrder', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderCreated');
      expect(Order.history.length).toBe(0);
      Meteor.call('advancedFulfillment/nonWarehouseOrder', Order._id, user._id);
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.advancedFulfillment.workflow.status).toBe('nonWarehouseOrder');
      expect(Order.history.length).toBe(1);
      expect(Order.history).toContain(jasmine.objectContaining({
        event: 'nonWarehouseOrder',
        userId: user._id
      }));
    });
  });
});
