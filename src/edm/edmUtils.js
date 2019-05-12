/*
 * @flow
 */
import { EDM } from '../utils/consts/FrontEndStateConsts';

export const getPropertyTypeId :string = (edm :Map, fqn :string) => edm.getIn([
  EDM.FQN_TO_ID,
  fqn
]);
