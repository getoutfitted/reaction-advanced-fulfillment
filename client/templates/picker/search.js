import { Template } from 'meteor/templating';
import './search.html';
Template['advancedFulfillment.picker.search'].onCreated(function () {
  this.subscribe('searchOrders');
});

