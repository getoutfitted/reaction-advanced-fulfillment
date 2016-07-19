import { SimpleSchema } from "meteor/aldeed:simple-schema";

export const AFCounter = new SimpleSchema({
  shopId: {
    type: String,
    optional: true
  },
  seq: {
    type: Number,
    optional: true,
    defaultValue: 10000
  },
  name: {
    type: String,
    optional: true
  }
});
