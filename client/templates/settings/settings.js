import { Template } from 'meteor/templating';
import { Reaction } from '/client/api';
import { Packages } from '/lib/collections';
import { AdvancedFulfillmentPackageConfig } from '../../../lib/collections/schemas';

import './settings.html';

Template.advancedFulfillmentSettings.helpers({
  AdvancedFulfillmentPackageConfig() {
    return AdvancedFulfillmentPackageConfig;
  },
  packageData() {
    return Packages.findOne({
      name: 'reaction-advanced-fulfillment',
      shopId: Reaction.getShopId()
    });
  }
});

AutoForm.hooks({
  'advanced-fulfillment-update-form': {
    onSuccess: function (operation, result, template) {
      Alerts.removeSeen();
      return Alerts.add('Advanced Fulfillment settings saved.', 'success', {
        autoHide: true
      });
    },
    onError: function (operation, error, template) {
      Alerts.removeSeen();
      return Alerts.add('Advanced Fulfillment settings update failed. ' + error, 'danger');
    }
  }
});
