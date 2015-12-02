45 Hillman Rd
Baraboo, WI, 53913

fedexTimeTable = {
  "ONE_DAY": 1,
  "TWO_DAYS": 2,
  "THREE_DAYS": 3,
  "FOUR_DAYS": 4,
  "FIVE_DAYS": 5,
  "SIX_DAYS": 6,
  "SEVEN_DAYS": 7,
  "EIGHT_DAYS": 8,
  "NINE_DAYS": 9,
  "TEN_DAYS": 10,
  "ELEVEN_DAYS": 11,
  "TWELVE_DAYS": 12,
  "THIRTEEN_DAYS": 13,
  "FOURTEEN_DAYS": 14,
  "FIFTEEN_DAYS": 15,
  "SIXTEEN_DAYS": 16,
  "SEVENTEEN_DAYS": 17,
  "EIGHTEEN_DAYS": 18,
  "NINETEEN_DAYS": 19,
  "TWENTY_DAYS  ": 20,
};

fedex.rates({
  ReturnTransitAndCommit: true,
  CarrierCodes: ['FDXE','FDXG'],
  RequestedShipment: {
    DropoffType: 'REGULAR_PICKUP',
    // ServiceType: 'GROUND_HOME_DELIVERY',
    PackagingType: 'YOUR_PACKAGING',
    Shipper: {
      Contact: {
        PersonName: 'Shipper Person',
        CompanyName: 'GetOutfitted',
        PhoneNumber: '5555555555'
      },
      Address: {
        StreetLines: [
          '103 Main St'
        ],
        City: 'Dillon',
        StateOrProvinceCode: 'CO',
        PostalCode: '80435',
        CountryCode: 'US'
      }
    },
    Recipient: {
      Contact: {
        PersonName: 'Receiver Person',
        CompanyName: 'Hotel',
        PhoneNumber: '5555555555'
      },
      Address: {
        StreetLines: [
          '739 E Pikes Peak Ave'
        ],
        City: 'Colorado Springs',
        StateOrProvinceCode: 'CO',
        PostalCode: '80903',
        CountryCode: 'US',
        Residential: false // Or true
      }
    },
    ShippingChargesPayment: {
      PaymentType: 'SENDER',
      Payor: {
        ResponsibleParty: {
          AccountNumber: fedex.options.account_number
        }
      }
    },
    PackageCount: '1',
    RequestedPackageLineItems: {
      SequenceNumber: 1,
      GroupPackageCount: 1,
      Weight: {
        Units: 'LB',
        Value: '7.0'
      },
      Dimensions: {
        Length: 24,
        Width: 17,
        Height: 8,
        Units: 'IN'
      }
    }
  }
}, function(err, res) {
  if(err) {
    return console.log(err);
  }
  res1 = res;
  console.log(res);
});
