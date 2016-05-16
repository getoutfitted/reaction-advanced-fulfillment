function verifyPreSharedKey(key, service) {
  const af = ReactionCore.Collections.Packages.findOne({
    name: 'reaction-advanced-fulfillment',
    shopId: ReactionCore.getShopId()
  });
  if (af && af.settings && af.settings[service].enabled) {
    return key === af.settings[service].preSharedKey;
  }

  ReactionCore.Log.error('Error verifying preSharedKey because AfterShip preshared key not found. ');
  return false;
}

JsonRoutes.add("post", "/dashboard/advanced-fullfillment/webhooks/aftership/post", function (req, res, next) {

  let keyMatches =  verifyPreSharedKey(req.query.key, 'aftership');
  if (keyMatches) {
    ReactionCore.Log.info('Successfully Authenticated Aftership Key.');
    Meteor.call('aftership/processHook', req.body);
    return JsonRoutes.sendResult(res, {code: 200});
  }
  return JsonRoutes.sendResult(res, {code: 403});
});

