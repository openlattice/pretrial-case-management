/*
 * @flow
 */
import { APP } from './consts/FrontEndStateConsts';

const getEntitySetId :string = (app, FQN :string, orgId :string) => app.getIn([
  FQN,
  APP.ENTITY_SETS_BY_ORG,
  orgId
]);

export default getEntitySetId;
