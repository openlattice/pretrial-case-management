import { APP_DATA } from './consts/redux/AppConsts';

import { ORG_IDS } from './consts/DataModelConsts';
import { CONTEXT } from './consts/Consts';

const {
  COURT_LINCOLN,
  COURT_MINN,
  COURT_PENN,
  COURT_SHELBY,
  DEMO_ORG,
} = CONTEXT;

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

export const getEntitySetIdFromApp = (app, fqn) => {
  const orgId = app.get(APP_DATA.SELECTED_ORG_ID);
  return app.getIn([
    fqn,
    APP_DATA.ENTITY_SETS_BY_ORG,
    orgId
  ]);
};

export const getJurisdiction = (selectedOrganizationId) => {
  let jurisdiction;
  switch (selectedOrganizationId) {
    case ORG_IDS.PENNINGTON_SD:
      jurisdiction = COURT_PENN;
      break;
    case ORG_IDS.LINCOLN_SD:
      jurisdiction = COURT_LINCOLN;
      break;
    case ORG_IDS.MINNEHAHA_SD:
      jurisdiction = COURT_MINN;
      break;
    case ORG_IDS.SHELBY_TN:
      jurisdiction = COURT_SHELBY;
      break;
    case ORG_IDS.DEMO_ORG:
    case ORG_IDS.PCM_DEMO_ORG:
    default:
      jurisdiction = DEMO_ORG;
      break;
  }
  return jurisdiction;
};
