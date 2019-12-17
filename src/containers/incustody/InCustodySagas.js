/*
 * @flow
 */

import Papa from 'papaparse';
import type { SequenceAction } from 'redux-reqseq';
import { DateTime } from 'luxon';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import {
  fromJS,
  List,
  Map,
  Set
} from 'immutable';
import {
  call,
  put,
  takeEvery,
  select
} from '@redux-saga/core/effects';

import FileSaver from '../../utils/FileSaver';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { MAX_HITS } from '../../utils/consts/Consts';
import { getEntityProperties, getEntityKeyId } from '../../utils/DataUtils';
import { getPropertyTypeId } from '../../edm/edmUtils';
import { getMostRecentPSA } from '../../utils/PSAUtils';
import { getChargeHistory, getCasesForPSA } from '../../utils/CaseUtils';
import { HEADERS_OBJ, POSITIONS } from '../../utils/consts/downloads/InCustodyReport';
import { formatDateTime, formatDate } from '../../utils/FormattingUtils';

import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { REVIEW, PSA_ASSOCIATION, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { IN_CUSTODY_DATA } from '../../utils/consts/redux/InCustodyConsts';
import { PEOPLE_DATA } from '../../utils/consts/redux/PeopleConsts';

import { getPeopleNeighbors } from '../people/PeopleActions';
import {
  DOWNLOAD_IN_CUSTODY_REPORT,
  downloadInCustodyReport,
  GET_IN_CUSTODY_DATA,
  getInCustodyData
} from './InCustodyActions';

const {
  CHARGES,
  ARREST_BONDS,
  JAIL_STAYS,
  PEOPLE,
  MANUAL_PRETRIAL_CASES,
  PRETRIAL_CASES,
  PSA_SCORES
} = APP_TYPES;

const {
  ARREST_DATE_TIME,
  COMPLETED_DATE_TIME,
  DATE_TIME,
  DISPOSITION_DATE,
  RELEASE_DATE_TIME,
  START_DATE_TIME,
  TIMESTAMP
} = PROPERTY_TYPES;

const DATETIME_FQNS = [
  TIMESTAMP,
  COMPLETED_DATE_TIME,
  DATE_TIME,
  ARREST_DATE_TIME,
  START_DATE_TIME
];

const { searchEntitySetData, searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntitySetDataWorker, searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

/*
 * Selectors
 */
const getApp = state => state.get(STATE.APP, Map());
const getEDM = state => state.get(STATE.EDM, Map());
const getOrgId = state => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');
const getInCustodyState = state => state.get(STATE.IN_CUSTODY, Map());
const getPeopleState = state => state.get(STATE.PEOPLE, Map());
const getReviewState = state => state.get(STATE.REVIEW, Map());

const getUpdatedEntity = (combinedEntityInit, appTypeFqn, details) => {
  let combinedEntity = combinedEntityInit;
  if (appTypeFqn === CHARGES) {
    const { [DISPOSITION_DATE]: dispositionDate } = getEntityProperties(details, [DISPOSITION_DATE]);
    const keyString = appTypeFqn;
    const headerString = dispositionDate
      ? `complete|${HEADERS_OBJ[keyString]}`
      : `pending|${HEADERS_OBJ[keyString]}`;
    let newArrayValues = combinedEntity.get(headerString, List());
    let statute = '';
    let description = '';
    details.keySeq().forEach((fqn) => {
      if (headerString) {
        details.get(fqn).forEach((val) => {
          if (fqn === PROPERTY_TYPES.CHARGE_STATUTE) {
            statute = val;
          }
          else if (fqn === PROPERTY_TYPES.CHARGE_DESCRIPTION) {
            description = val;
          }
        });
      }
    });
    if (statute.length && description.length) {
      const chargeString = `${statute}|${description}`;
      newArrayValues = newArrayValues.push(chargeString);
      combinedEntity = combinedEntity.set(headerString, newArrayValues);
    }
  }
  else if (appTypeFqn === ARREST_BONDS) {
    const keyString = appTypeFqn;
    const headerString = HEADERS_OBJ[keyString];
    let newArrayValues = combinedEntity.get(headerString, List());
    let bondType = '';
    let bondAmount = '';
    details.keySeq().forEach((fqn) => {
      if (headerString) {
        details.get(fqn).forEach((val) => {
          if (fqn === PROPERTY_TYPES.BOND_TYPE) {
            bondType = val;
          }
          else if (fqn === PROPERTY_TYPES.BOND_AMOUNT) {
            bondAmount = val;
          }
        });
      }
    });
    if (bondType.length && bondAmount.length) {
      const chargeString = `${bondType}|${bondAmount}`;
      newArrayValues = newArrayValues.push(chargeString);
      combinedEntity = combinedEntity.set(headerString, newArrayValues);
    }
  }
  else {
    details.keySeq().forEach((fqn) => {
      const keyString = `${fqn}|${appTypeFqn}`;
      const headerString = HEADERS_OBJ[keyString];
      const header = headerString;
      if (header) {
        let newArrayValues = combinedEntity.get(header, List());
        details.get(fqn).forEach((val) => {
          let newVal = val;
          if (DATETIME_FQNS.includes(fqn)) {
            newVal = formatDateTime(val);
          }
          if (fqn === PROPERTY_TYPES.DOB) {
            newVal = formatDate(val);
          }
          if (!newArrayValues.includes(val)) {
            newArrayValues = newArrayValues.push(newVal);
          }
        });
        combinedEntity = combinedEntity.set(header, newArrayValues);
      }
    });
  }

  return combinedEntity;
};

function* downloadInCustodyReportWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(downloadInCustodyReport.request(action.id));

    const inCustodyState = yield select(getInCustodyState);
    const currentJailStays = inCustodyState.get(IN_CUSTODY_DATA.JAIL_STAYS_BY_ID, Map());

    if (currentJailStays.size) {
      const {
        peopleNeighborsById,
        psaNeighborsById
      } = action.value;
      const app = yield select(getApp);
      const orgId = yield select(getOrgId);
      const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
      const jailStayNeighborsById = inCustodyState.get(IN_CUSTODY_DATA.JAIL_STAY_NEIGHBORS_BY_ID, Map());
      const usableJailStayNeighbors = Map().withMutations((mutableMap) => {
        currentJailStays.entrySeq().forEach(([jailStayEKID, jailStay]) => {
          let usableNeighbors = List();
          const jailStayNeighbors :Map = jailStayNeighborsById.get(jailStayEKID, Map());
          const arrestBonds = jailStayNeighbors.get(ARREST_BONDS, List());
          usableNeighbors = usableNeighbors.concat(arrestBonds);
          const person :Map = jailStayNeighbors.get(PEOPLE, Map());
          const personEKID :EKID = getEntityKeyId(person);
          const personNeighbors :Map = peopleNeighborsById.get(personEKID, Map());
          const personPSAs :List = personNeighbors.get(PSA_SCORES, List());
          const personCharges :List = personNeighbors.get(CHARGES, List());
          const personPretrialCases :List = personNeighbors.get(PRETRIAL_CASES, List());
          const { mostRecentPSA, mostRecentPSAEKID } = getMostRecentPSA(personPSAs);
          const psaNeighbors :Map = psaNeighborsById.get(mostRecentPSAEKID, Map());
          const arrestCase :Map = psaNeighbors.get(MANUAL_PRETRIAL_CASES, Map());
          const chargeHistory = getChargeHistory(personCharges);
          const { [ARREST_DATE_TIME]: arrestDateTime } = getEntityProperties(arrestCase, [ARREST_DATE_TIME]);
          const { chargeHistoryForMostRecentPSA } = getCasesForPSA(
            personPretrialCases,
            chargeHistory,
            mostRecentPSA,
            arrestDateTime
          );
          const chargeList = chargeHistoryForMostRecentPSA.valueSeq().flatten();
          usableNeighbors = usableNeighbors.concat(chargeList);
          const looseNeighbors = List.of(jailStay, person, mostRecentPSA);
          const allNeighbors = usableNeighbors.concat(looseNeighbors);
          mutableMap.set(jailStayEKID, allNeighbors);
        });
      });
      console.log(usableJailStayNeighbors.toJS());
      let jsonResults = List();
      let allHeaders = Set();
      usableJailStayNeighbors.entrySeq().forEach(([_, neighbors]) => {
        let combinedEntity = Map();
        neighbors.forEach((neighbor) => {
          const neighborEntitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
          const neighborAppTypeFqn = entitySetIdsToAppType.get(neighborEntitySetId, '');
          combinedEntity = getUpdatedEntity(
            combinedEntity,
            neighborAppTypeFqn,
            neighbor.get(PSA_NEIGHBOR.DETAILS, neighbor)
          );
          allHeaders = allHeaders.union(combinedEntity.keys())
            .sort((header1, header2) => (POSITIONS.indexOf(header1) >= POSITIONS.indexOf(header2) ? 1 : -1));
        });
        if (
          combinedEntity.get('FIRST')
          || combinedEntity.get('MIDDLE')
          || combinedEntity.get('LAST')
        ) {
          jsonResults = jsonResults.push(combinedEntity);
        }
        jsonResults = jsonResults.sortBy(psa => psa.get('FIRST')).sortBy(psa => psa.get('LAST'));
      });

      const fields = allHeaders.toJS();
      const csv = Papa.unparse({
        fields,
        data: jsonResults.toJS()
      });

      const name = `in_custody_report_${DateTime.local().toISODate()}`;

      FileSaver.saveFile(csv, name, 'csv');
    }

    yield put(downloadInCustodyReport.success(action.id));
  }
  catch (error) {
    console.error(error);
    yield put(downloadInCustodyReport.failure(action.id, { error }));
  }
  finally {
    yield put(downloadInCustodyReport.finally(action.id));
  }
}

function* downloadInCustodyReportWatcher() :Generator<*, *, *> {
  yield takeEvery(DOWNLOAD_IN_CUSTODY_REPORT, downloadInCustodyReportWorker);
}

function* getInCustodyDataWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(getInCustodyData.request(action.id));
    let peopleInCustody = Map();
    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);

    const arrestBondsESID :UUID = getEntitySetIdFromApp(app, ARREST_BONDS);
    const jailStaysESID :UUID = getEntitySetIdFromApp(app, JAIL_STAYS);
    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);

    const startDatePropertyTypeId :UUID = getPropertyTypeId(edm, START_DATE_TIME);
    const releaseDatePropertyTypeId :UUID = getPropertyTypeId(edm, RELEASE_DATE_TIME);

    const searchTerm = `_exists_:entity.${startDatePropertyTypeId} AND NOT _exists_:entity.${releaseDatePropertyTypeId}`;
    const options = {
      searchTerm,
      start: 0,
      maxHits: MAX_HITS,
      fuzzy: false
    };
    /* get all judge data */
    const jailStayResponse = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData({ entitySetId: jailStaysESID, searchOptions: options })
    );
    if (jailStayResponse.error) throw jailStayResponse.error;
    const activeJailStays = fromJS(jailStayResponse.data.hits);
    const jailStaysById = Map().withMutations((mutableMap) => {
      activeJailStays.forEach((jailStay) => {
        const jailStayEKID = getEntityKeyId(jailStay);
        mutableMap.set(jailStayEKID, jailStay);
      });
    });

    let neighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: jailStaysESID,
        filter: {
          entityKeyIds: jailStaysById.keySeq().toJS(),
          sourceEntitySetIds: [peopleESID],
          destinationEntitySetIds: [arrestBondsESID]
        }
      })
    );
    if (neighborsById.error) throw neighborsById.error;
    neighborsById = fromJS(neighborsById.data);

    const neighborsByAppTypeFqn = Map().withMutations((mutableMap) => {
      neighborsById.entrySeq().forEach(([id, neighbors]) => {
        neighbors.forEach((neighbor) => {
          const entityKeyId = getEntityKeyId(neighbor);
          const neighborESID = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
          const appTypeFqn = entitySetIdsToAppType.get(neighborESID, '');
          if (appTypeFqn === PEOPLE) {
            mutableMap.setIn([id, PEOPLE], neighbor);
            peopleInCustody = peopleInCustody.set(entityKeyId, neighbor);
          }
          else if (appTypeFqn === ARREST_BONDS) {
            mutableMap.setIn(
              [id, ARREST_BONDS],
              mutableMap.getIn([id, ARREST_BONDS], List()).push(neighbor)
            );
          }
        });
      });
    });

    const loadPersonNeighborsRequest = getPeopleNeighbors({
      peopleEKIDS: peopleInCustody.keySeq().toJS(),
      srcEntitySets: [],
      dstEntitySets: [CHARGES, PRETRIAL_CASES]
    });
    yield put(loadPersonNeighborsRequest);

    yield put(getInCustodyData.success(action.id, {
      jailStaysById,
      neighborsByAppTypeFqn,
      peopleInCustody
    }));
  }
  catch (error) {
    console.error(error);
    yield put(getInCustodyData.failure(action.id, { error }));
  }
  finally {
    yield put(getInCustodyData.finally(action.id));
  }
}

function* getInCustodyDataWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_IN_CUSTODY_DATA, getInCustodyDataWorker);
}


export {
  downloadInCustodyReportWatcher,
  getInCustodyDataWatcher
};
