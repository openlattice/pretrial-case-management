/*
 * @flow
 */
import { APP } from './consts/FrontEndStateConsts';

export const defaultSettings = {
  contexts: {
    court: true,
    booking: true
  },
  loadCasesOnTheFly: false,
  courtRemindersEnabled: false,
  modules: {
    psa: true,
    pretrial: false
  }
};

export const getEntitySetIdFromApp :string = (app, FQN :string) => {
  const orgId = app.get(APP.SELECTED_ORG_ID);
  return app.getIn([
    FQN,
    APP.ENTITY_SETS_BY_ORG,
    orgId
  ]);
};
