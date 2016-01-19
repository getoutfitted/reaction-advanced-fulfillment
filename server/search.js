SearchSource.defineSource('orders', function (searchText) {
  const options = { limit: 10 };
  if (searchText) {
    const selector = {shopifyOrderNumber: parseInt(searchText, 10)};
    return Orders.find(selector, options).fetch();
  }
  return ReactionCore.Collections.Orders.find({}, options).fetch();
});

// function buildRegExp(searchText) {
//   var words = searchText.trim().split(/[ \-\:]+/);
//   var exps = _.map(words, function(word) {
//     return "(?=.*" + word + ")";
//   });
//   var fullExp = exps.join('') + ".+";
//   return new RegExp(fullExp, "i");
// }
