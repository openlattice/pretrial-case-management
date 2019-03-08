/*
 * @flow
 */
import { APP } from './consts/FrontEndStateConsts';

export const getEntitySetIdFromApp :string = (app, FQN :string, orgId :string) => app.getIn([
  FQN,
  APP.ENTITY_SETS_BY_ORG,
  orgId
]);
