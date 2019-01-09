/*
 * @flow
 */
import { EDM } from '../utils/consts/FrontEndStateConsts';

export const getPropertyTypeId :string = (edm, FQN :string) => edm.getIn([
  EDM.FQN_TO_ID,
  FQN
]);
