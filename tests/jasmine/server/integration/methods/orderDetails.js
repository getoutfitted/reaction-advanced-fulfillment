beforeAll(function () {
  VelocityHelpers.exportGlobals();
});

describe('getoutfitted:reaction-advanced-fulfillment orderDetails methods', function () {
  describe('advancedFulfillment/updateOrderWorkflow', function () {
    beforeEach(function () {
      return ReactionCore.Collections.Orders.remove({});
    });
    it('should update the order workflow from created to printed', function () {
      const Order = Factory.create('importedShopifyOrder');
      const userId = Random.id();
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      expect(Order.advancedFulfillment.workflow.status).toEqual('orderCreated');
      expect(Order.history.length).toBe(0);
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, userId, Order.advancedFulfillment.workflow.status);
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
      const updatedOrder = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(updatedOrder.advancedFulfillment.workflow.status).toEqual('orderPrinted');
      expect(updatedOrder.history.length).toBe(1);
      expect(updatedOrder.history).toContain(jasmine.objectContaining({event: 'orderPrinted'}));
    });
    it('should update through the entire workflow', function () {
      let Order = Factory.create('importedShopifyOrder');
      const userId = Random.id();
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      expect(Order.advancedFulfillment.workflow.status).toEqual('orderCreated');
      expect(Order.history.length).toBe(0);
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, userId, Order.advancedFulfillment.workflow.status);
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.advancedFulfillment.workflow.status).toEqual('orderPrinted');
      expect(Order.history.length).toBe(1);
      Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, userId, Order.advancedFulfillment.workflow.status);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.advancedFulfillment.workflow.status).toEqual('orderPicking');
      expect(Order.history.length).toBe(2);
      Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, userId, Order.advancedFulfillment.workflow.status);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.advancedFulfillment.workflow.status).toEqual('orderPicked');
      expect(Order.history.length).toBe(3);
    });
    it('should throw an error if incorrect permissions', function () {
      let Order = Factory.create('importedShopifyOrder');
      const userId = Random.id();
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      expect(Order.advancedFulfillment.workflow.status).toEqual('orderCreated');
      expect(Order.history.length).toBe(0);
      spyOn(ReactionCore, 'hasPermission').and.returnValue(false);
      expect(function () {
        return Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, userId, Order.advancedFulfillment.workflow.status);
      }).toThrowError('Access Denied [403]');
    });
  });
  describe('advancedFulfillment/reverseOrderWorkflow', function () {
    beforeEach(function () {
      return ReactionCore.Collections.Orders.remove({});
    });
    it('should reverse the workflow', function () {
      let Order = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderPicking'
      });
      const userId = Random.id();
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      expect(Order.advancedFulfillment.workflow.status).toEqual('orderPicking');
      expect(Order.history.length).toBe(0);
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      Meteor.call('advancedFulfillment/reverseOrderWorkflow', Order._id, userId, Order.advancedFulfillment.workflow.status);
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderPrinted');
      expect(Order.history.length).toBe(1);
    });
    it('should reverse the workflow multiple times', function () {
      let Order = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderPicking'
      });
      const userId = Random.id();
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      expect(Order.advancedFulfillment.workflow.status).toEqual('orderPicking');
      expect(Order.history.length).toBe(0);
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      Meteor.call('advancedFulfillment/reverseOrderWorkflow', Order._id, userId, Order.advancedFulfillment.workflow.status);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderPrinted');
      expect(Order.history.length).toBe(1);
      Meteor.call('advancedFulfillment/reverseOrderWorkflow', Order._id, userId, Order.advancedFulfillment.workflow.status);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderCreated');
      expect(Order.history.length).toBe(2);
    });
  });
  describe('advancedFulfillment/orderCompletionVerifier', function () {
    beforeEach(function () {
      return ReactionCore.Collections.Orders.remove({});
    });
    it('should update order to incomplete if not items returned', function () {
      let Order = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderReturned'
      });
      const userId = Random.id();
      expect(Order.advancedFulfillment.workflow.status).toEqual('orderReturned');
      expect(Order.advancedFulfillment.items.length).toBeGreaterThan(0);
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      Meteor.call('advancedFulfillment/orderCompletionVerifier', Order, userId);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderIncomplete');
      expect(Order.history).toContain(jasmine.objectContaining({event: 'orderIncomplete'}));
    });
    it('should update order to complete if all items returned', function () {
      let Order = Factory.create('importedShopifyOrder', {
        'advancedFulfillment.workflow.status': 'orderReturned'
      });
      const userId = Random.id();
      expect(Order.advancedFulfillment.workflow.status).toEqual('orderReturned');
      expect(Order.advancedFulfillment.items.length).toBeGreaterThan(0);
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      spyOn(_, 'every').and.returnValue(true);
      Meteor.call('advancedFulfillment/orderCompletionVerifier', Order, userId);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderCompleted');
      expect(Order.history).toContain(jasmine.objectContaining({event: 'orderCompleted'}));
    });
  });
  describe('advancedFulfillment/updateOrderNotes', function () {
    beforeEach(function () {
      Meteor.users.remove({});
      return ReactionCore.Collections.Orders.remove({});
    });
    it('should create a new note with user info', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      expect(Order.orderNotes).not.toBeDefined();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      const notes = 'Here are my test notes';
      Meteor.call('advancedFulfillment/updateOrderNotes', Order, notes, user.username);
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.orderNotes).toMatch(notes);
      expect(Order.orderNotes).toMatch(user.username);
    });
    it('should add to an orderNote when called multiple times', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      const altUser = Factory.create('afUser');
      expect(Order.orderNotes).not.toBeDefined();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      const notes = 'Here are my test notes';
      Meteor.call('advancedFulfillment/updateOrderNotes', Order, notes, user.username);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.orderNotes).toMatch(notes);
      expect(Order.orderNotes).toMatch(user.username);
      const altNotes = 'The altuser said this!';
      Meteor.call('advancedFulfillment/updateOrderNotes', Order, altNotes, altUser.username);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.orderNotes).toMatch(notes);
      expect(Order.orderNotes).toMatch(user.username);
      expect(Order.orderNotes).toMatch(altNotes);
      expect(Order.orderNotes).toMatch(altUser.username);
    });
  });
  describe('advancedFulfillment/printInvoice', function () {
    beforeEach(function () {
      return ReactionCore.Collections.Orders.remove({});
    });
    it('should update order to printed', function () {
      let Order = Factory.create('importedShopifyOrder');
      const userId = Random.id();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderCreated');
      expect(Order.history.length).toBe(0);
      Meteor.call('advancedFulfillment/printInvoice', Order._id, userId);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.advancedFulfillment.workflow.status).toBe('orderPrinted');
      expect(Order.history).toContain(jasmine.objectContaining({event: 'orderPrinted'}));
      expect(Order.history.length).toBe(1);
    });
  });
  describe('advancedFulfillment/updateRentalDates', function () {
    beforeEach(function () {
      Meteor.users.remove({});
      return ReactionCore.Collections.Orders.remove({});
    });
    it('should throw a warning if no fedex api info', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      const newStart = moment().add(9, 'day').toDate();
      const endDate = moment().add(13, 'day').toDate();
      let sameStart = moment(Order.startTime).isSame(newStart, 'day');
      let sameEnd = moment(Order.endTime).isSame(endDate, 'day');
      expect(sameStart).not.toEqual(true);
      expect(sameEnd).not.toEqual(true);
      spyOn(ReactionCore.Log, 'warn').and.callThrough();
      Meteor.call('advancedFulfillment/updateRentalDates', Order._id, newStart, endDate, user);
      expect(ReactionCore.Log.warn).toHaveBeenCalled();
    });
    it('should update the rental start and end dates', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      const newStart = moment().add(9, 'day').toDate();
      const endDate = moment().add(13, 'day').toDate();
      let sameStart = moment(Order.startTime).isSame(newStart, 'day');
      let sameEnd = moment(Order.endTime).isSame(endDate, 'day');
      expect(sameStart).not.toEqual(true);
      expect(sameEnd).not.toEqual(true);
      spyOn(AdvancedFulfillment.FedExApi, 'getFedexTransitTime').and.returnValue(4);
      Meteor.call('advancedFulfillment/updateRentalDates', Order._id, newStart, endDate, user);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      sameStart = moment(Order.startTime).isSame(newStart, 'day');
      sameEnd = moment(Order.endTime).isSame(endDate, 'day');
      expect(sameStart).toBe(true);
      expect(sameEnd).toBe(true);
    });
    it('should update the arrival and return date', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      const newStart = moment().add(9, 'day').toDate();
      const endDate = moment().add(13, 'day').toDate();
      let setArrivalDate = moment().add(3, 'day').toDate();
      let setReturnDate = moment().add(9, 'day').toDate();
      let verifyArriveDate = moment(Order.advancedFulfillment.arriveBy).isSame(setArrivalDate, 'day');
      let verifyShipByDate = moment(Order.advancedFulfillment.shipReturnBy).isSame(setReturnDate, 'day');
      expect(verifyArriveDate).toBe(true);
      expect(verifyShipByDate).toBe(true);
      spyOn(AdvancedFulfillment.FedExApi, 'getFedexTransitTime').and.returnValue(4);
      Meteor.call('advancedFulfillment/updateRentalDates', Order._id, newStart, endDate, user);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      let newArrivalDate = moment(newStart).subtract(1, 'day').toDate();
      let newShipByDate = moment(endDate).add(1, 'day').toDate();

      let arriveByResult = moment(Order.advancedFulfillment.arriveBy).isSame(newArrivalDate, 'day');
      expect(arriveByResult).toBe(true);
      let shipByResult = moment(Order.advancedFulfillment.shipReturnBy).isSame(newShipByDate, 'day');
      expect(shipByResult).toBe(true);

      // sameStart = moment(Order.advancedFulfillment.arriveBy).isSame(newStart, 'day');
      // sameEnd = moment(Order.endTime).isSame(endDate, 'day');
      // expect(sameStart).toBe(true);
      // expect(sameEnd).toBe(true);
    });
  });
  describe('advancedFulfillment/updateShippingAddress', function () {
    // XXX TODO: Run this test later
  });
  describe('advancedFulfillment/updateContactInformation', function () {
    beforeEach(function () {
      Meteor.users.remove({});
      return ReactionCore.Collections.Orders.remove({});
    });
    it('should update phone and email', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      spyOn(Meteor, 'userId').and.returnValue(user._id);
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      let phone = '1234567';
      let email = 'test@getoutfitted.com';
      Meteor.call('advancedFulfillment/updateContactInformation', Order._id, phone, email);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.email).toBe('test@getoutfitted.com');
      expect(Order.shipping[0].address.phone).toBe('1234567');
    });
    it('should log success when successful', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      spyOn(Meteor, 'userId').and.returnValue(user._id);
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      spyOn(ReactionCore.Log, 'info').and.callThrough();
      let phone = '1234567';
      let email = 'test@getoutfitted.com';
      Meteor.call('advancedFulfillment/updateContactInformation', Order._id, phone, email);
      expect(ReactionCore.Log.info).toHaveBeenCalled();
    });
    it('should add a history object when updated', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      spyOn(Meteor, 'userId').and.returnValue(user._id);
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      expect(Order.history.length).toBe(0);
      let phone = '1234567';
      let email = 'test@getoutfitted.com';
      Meteor.call('advancedFulfillment/updateContactInformation', Order._id, phone, email);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.history.length).toBe(1);
      expect(Order.history).toContain(jasmine.objectContaining({event: 'orderContactInfoUpdated'}));
      expect(Order.history).toContain(jasmine.objectContaining({userId: user._id}));
    });
    it('should throw an error when no phone number', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      spyOn(Meteor, 'userId').and.returnValue(user._id);
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      let phone = '1234567';
      let email;
      expect(function () {
        return Meteor.call('advancedFulfillment/updateContactInformation', Order._id, phone, email);
      }).toThrow();
    });
    it('should throw an error when no email', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      spyOn(Meteor, 'userId').and.returnValue(user._id);
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      let phone;
      let email = 'test@getoutfitted.com';
      expect(function () {
        return Meteor.call('advancedFulfillment/updateContactInformation', Order._id, phone, email);
      }).toThrow();
    });
  });
  describe('advancedFulfillment/updateItemsColorAndSize', function () {
    beforeEach(function () {
      Meteor.users.remove({});
      ReactionCore.Collections.Products.remove({});
      return ReactionCore.Collections.Orders.remove({});
    });
    it('should update an items location and sku', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      let product = Factory.create('afProduct');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      let itemId = Order.advancedFulfillment.items[0]._id;
      let variantId = product.variants[1]._id;
      expect(Order.advancedFulfillment.items[0].sku).toBe('SG001');
      Meteor.call('advancedFulfillment/updateItemsColorAndSize', Order, itemId, product._id, variantId, user);
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.advancedFulfillment.items[0].sku).toBe('MB005');
      expect(Order.advancedFulfillment.items[0].location).toBe('A3');
    });
    it('should update items color and size', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      let product = Factory.create('afProduct');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      let itemId = Order.advancedFulfillment.items[0]._id;
      let variantId = product.variants[1]._id;
      expect(Order.items[0].variants.color).toBe('Black');
      expect(Order.items[0].variants.size).toBe('One Size');
      Meteor.call('advancedFulfillment/updateItemsColorAndSize', Order, itemId, product._id, variantId, user);
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.advancedFulfillment.items[0].variantId).toBe(variantId);
      expect(Order.items[0].variants.color).toBe('Grayeen');
      expect(Order.items[0].variants.size).toBe('Small');
    });
    it('should update order notes', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      let product = Factory.create('afProduct');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      let itemId = Order.advancedFulfillment.items[0]._id;
      let variant = product.variants[1];
      let variantId = variant._id;
      expect(Order.orderNotes).toBe(undefined);
      Meteor.call('advancedFulfillment/updateItemsColorAndSize', Order, itemId, product._id, variantId, user);
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.orderNotes).toMatch(product.title);
      expect(Order.orderNotes).toMatch(variant.color);
      expect(Order.orderNotes).toMatch(variant.size);
      expect(Order.orderNotes).toMatch(user.username);
    });
    it('should reset the flag if all items have variants', function () {
      let Order = Factory.create('importedShopifyOrder', {
        itemMissingDetails: true
      });
      const user = Factory.create('user');
      let product = Factory.create('afProduct');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      let itemId = Order.advancedFulfillment.items[0]._id;
      let variant = product.variants[1];
      let variantId = variant._id;
      expect(Order.itemMissingDetails).toBe(true);
      Meteor.call('advancedFulfillment/updateItemsColorAndSize', Order, itemId, product._id, variantId, user);
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.itemMissingDetails).toBe(false);
    });
  });
  describe('advancedFulfillment/itemExchange', function () {
    beforeEach(function () {
      Meteor.users.remove({});
      ReactionCore.Collections.Products.remove({});
      return ReactionCore.Collections.Orders.remove({});
    });
    it('should exchange items', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      let product = Factory.create('afProduct');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      let item = Order.advancedFulfillment.items[0];
      expect(item.itemDescription).toBe('Mens - Smith - Vice');
      let variant = product.variants[1];
      Meteor.call('advancedFulfillment/itemExchange', Order, item._id, product.productType, product.gender, product.title, variant.color, variant._id, user);
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.advancedFulfillment.items[0].itemDescription).toBe('Mens - Burton - Cargo Pant');
      expect(Order.advancedFulfillment.items[0].variantId).toBe(variant._id);
    });
    it('should add ordernotes to order', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      let product = Factory.create('afProduct');
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      let item = Order.advancedFulfillment.items[0];
      expect(Order.orderNotes).toBe();
      let variant = product.variants[1];
      Meteor.call('advancedFulfillment/itemExchange', Order, item._id, product.productType, product.gender, product.title, variant.color, variant._id, user);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.orderNotes).toMatch('Mens - Burton - Cargo Pant');
      expect(Order.orderNotes).toMatch(user.username);
      expect(Order.orderNotes).toMatch('Small');
      expect(Order.orderNotes).toMatch('Grayeen');
    });
    it('should reset the flag if item was missing details', function () {
      let Order = Factory.create('importedShopifyOrder', {
        itemMissingDetails: true
      });
      const user = Factory.create('user');
      let product = Factory.create('afProduct');
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      let item = Order.advancedFulfillment.items[0];
      expect(Order.itemMissingDetails).toBe(true);
      let variant = product.variants[1];
      Meteor.call('advancedFulfillment/itemExchange', Order, item._id, product.productType, product.gender, product.title, variant.color, variant._id, user);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.itemMissingDetails).toBe(false);
    });
    it('should add a history object when item exchanged', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      let product = Factory.create('afProduct');
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      let item = Order.advancedFulfillment.items[0];
      expect(Order.history.length).toBe(0);
      let variant = product.variants[1];
      Meteor.call('advancedFulfillment/itemExchange', Order, item._id, product.productType, product.gender, product.title, variant.color, variant._id, user);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.history.length).toBe(1);
      expect(Order.history).toContain(jasmine.objectContaining({event: 'itemExchange'}));
    });
  });
  describe('advancedFulfillment/addItem', function () {
    beforeEach(function () {
      Meteor.users.remove({});
      ReactionCore.Collections.Products.remove({});
      return ReactionCore.Collections.Orders.remove({});
    });
    it('should add an item to items and AF items', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      let product = Factory.create('afProduct');
      let variant = product.variants[1];
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      let afItemCount = Order.advancedFulfillment.items.length;
      let itemCount = Order.items.length;
      expect(Order.advancedFulfillment.items.length).toBe(afItemCount);
      expect(Order.items.length).toBe(itemCount);
      expect(Order.advancedFulfillment.items[afItemCount]).toBe(undefined);
      Meteor.call('advancedFulfillment/addItem', Order, product.productType, product.gender, product.title, variant.color, variant._id, user);
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.advancedFulfillment.items.length).toBe(afItemCount + 1);
      expect(Order.items.length).toBe(itemCount + 1);
      expect(Order.advancedFulfillment.items[afItemCount]).not.toBe(undefined);
      expect(Order.advancedFulfillment.items[afItemCount].itemDescription).toBe('Mens - Burton - Cargo Pant');
    });
    it('should add descriptive order notes when item added', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      let product = Factory.create('afProduct');
      let variant = product.variants[1];
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      expect(Order.orderNotes).toBe();
      Meteor.call('advancedFulfillment/addItem', Order, product.productType, product.gender, product.title, variant.color, variant._id, user);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.orderNotes).toMatch('Mens - Burton - Cargo Pant');
      expect(Order.orderNotes).toMatch(user.username);
      expect(Order.orderNotes).toMatch('Small');
      expect(Order.orderNotes).toMatch('Grayeen');
    });
    it('should add add a descriptive history object when item is added', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      let product = Factory.create('afProduct');
      let variant = product.variants[1];
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      expect(Order.history.length).toBe(0);
      Meteor.call('advancedFulfillment/addItem', Order, product.productType, product.gender, product.title, variant.color, variant._id, user);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.history.length).toBe(1);
      expect(Order.history).toContain(jasmine.objectContaining({event: 'itemAdded'}));
    });
  });
  describe('advancedFulfillment/bypassWorkflowAndComplete', function () {
    beforeEach(function () {
      Meteor.users.remove({});
      return ReactionCore.Collections.Orders.remove({});
    });
    it('should bypass the workflow the complete the order', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      expect(Order.advancedFulfillment.workflow.status).toBe('orderCreated');
      Meteor.call('advancedFulfillment/bypassWorkflowAndComplete', Order._id, user._id);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
      expect(Order.advancedFulfillment.workflow.status).toBe('orderCompleted');
    });
    it('should create two history objects', function () {
      let Order = Factory.create('importedShopifyOrder');
      const user = Factory.create('user');
      spyOn(ReactionCore, 'hasPermission').and.returnValue(true);
      expect(Order.history.length).toBe(0);
      Meteor.call('advancedFulfillment/bypassWorkflowAndComplete', Order._id, user._id);
      Order = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(Order.history.length).toBe(2);
      expect(Order.history).toContain(jasmine.objectContaining({event: 'bypassedWorkFlowToComplete'}));
      expect(Order.history).toContain(jasmine.objectContaining({event: 'orderCompleted'}));
    });
  });
});

