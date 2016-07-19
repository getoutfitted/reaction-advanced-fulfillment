import { Mongo } from 'meteor/mongo';
import * as Schemas from './schemas';
import { Orders } from '/lib/collections';

export const AFCounter = new Mongo.Collection('AFCounter');

AFCounter.attachSchema(Schemas.AFCounter);

Orders.attachSchema(Schemas.AdvancedFulfillment);

