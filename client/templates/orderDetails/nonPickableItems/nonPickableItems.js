Template.nonPickableItems.helpers({
  skiPackagesPurchased: function () {
    return this.advancedFulfillment.skiPackagesPurchased;
  }
});

Template.damageCoverage.helpers({
  qty: function (type) {
    return this.advancedFulfillment.damageCoverage[type].qty;
  },
  subtotal: function (type) {
    return this.advancedFulfillment.damageCoverage[type].subtotal;
  }
});

Template.skiPackages.helpers({
  skiPackages: function () {
    return this.advancedFulfillment.skiPackages;
  },
  ifAge: function () {
    let id = this._id;

    if (this.age) {
      return this.age;
    }
    return '<input class=form-control name=age-' + id + ' type=text placeholder="enter age">';
  },
  ifShoe: function () {
    let id = this._id;
    if (this.shoeSize) {
      return this.shoeSize;
    }
    return '<input class=form-control name=shoeSize-' + id + ' type=text placeholder="enter shoe size">';
  },
  ifSkiLevel: function () {
    let id = this._id;
    if (this.skiLevel) {
      return this.skiLevel;
    }
    return '<select class=form-control id=level-' + id + '>'
    + '<option disabled selected> -- select an skill level -- </option>'
    + '<option class=form-control value=green-beginner>green-beginner</option>'
    + '<option class=form-control value=yellow-intermediate>yellow-intermediate</option>'
    + '<option class=form-control value=blue-intermediate>blue-intermediate</option>'
    + '<option class=form-control value=black-advanced>black-advanced</option>'
    + '</select>';
  },
  noCustomerInfo: function () {
    if (this.skiLevel && this.shoeSize && this.age) {
      return false;
    }
    return true;
  }
});

Template.skiPackages.events({
  'click .save-customer-info': function (event) {
    event.preventDefault();
    let id = this._id;
    let orderId = Template.parentData()._id;
    let userId = Meteor.userId();
    let age = $('[name=age-' + id + ']').val();
    if (age) {
      age = parseInt(age, 10);
    }
    let shoeSize = $('[name=shoeSize-' + id + ']').val();
    let level = $('#level-' + id).val();
    Meteor.call('advancedFulfillment/updateSkiPackageWithCustomerInfo', orderId, userId, id, age, shoeSize, level);
  }
});
