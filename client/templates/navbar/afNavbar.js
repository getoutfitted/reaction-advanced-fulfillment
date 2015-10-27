Template.afNavbar.onRendered(function () {
  $('.navbar-primary-tags').hide();
});

Template.afNavbar.helpers({
  todaysDate: function () {
    return moment().format('MM-DD-YYYY');
  },
  tomorrowsDate: function () {
    return moment().add(1, 'days').format('MM-DD-YYYY');
  },
  yesterdaysDate: function () {
    return moment().subtract(1, 'days').format('MM-DD-YYYY');
  }
});

Template.afNavbar.events({
  'click #afSearchButton': function (event) {
    event.preventDefault();
    let orderId = $('#afSearchInput').val();
    Router.go('orderDetails', {_id: orderId});
  },
  'click #afShipButton': function (event) {
    event.preventDefault();
    let unfilteredDate = $('#afShipInput').val();
    let verifiedDate = moment(unfilteredDate).isValid();
    if (verifiedDate) {
      let date = moment(unfilteredDate).format('MM-DD-YYYY');
      Router.go('dateShipping', {date: date});
    }
  }
});
