// SearchSource.defineSource('orders', function (searchText) {
//   const options = { limit: 10 };
//   if (searchText) {
//     const selector = {shopifyOrderNumber: parseInt(searchText, 10)};
//     return ReactionCore.Collections.Orders.find(selector, options).fetch();
//   }
//   return ReactionCore.Collections.Orders.find({}, options).fetch();
// });
