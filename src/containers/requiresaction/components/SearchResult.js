/*
 * @flow
 */

import React from 'react';

import { List, Map, get, getIn, fromJS } from 'immutable';
import { Card, CardSegment, Label, Skeleton, Tag } from 'lattice-ui-kit';
import { DataUtils, ReduxUtils } from 'lattice-utils';
import { DateTime } from 'luxon';
import { useSelector } from 'react-redux';
import styled, { css } from 'styled-components';

import REVIEW_DATA from '../../../utils/consts/redux/ReviewConsts';
import PSAMetaData from '../../../components/review/PSAMetaData';
import { getPendingCharges } from '../../../utils/AutofillUtils';
import { getEntityProperties } from '../../../utils/DataUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../../utils/consts/DataModelConsts';
import { PSA_ASSOCIATION } from '../../../utils/consts/FrontEndStateConsts';
import { APP_DATA } from '../../../utils/consts/redux/AppConsts';
import { LOAD_PSA_DATA } from '../../review/ReviewActions';
import { PEOPLE_ACTIONS, PEOPLE_DATA } from '../../../utils/consts/redux/PeopleConsts';
import { REDUX, STATE } from '../../../utils/consts/redux/SharedConsts';
import ScoreScale from '../../../components/ScoreScale'
import BooleanFlag from '../../../components/BooleanFlag'
import { REQUEST_STATE } from '../../../core/redux/constants';

const Data = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const BottomContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
`;

const FlagContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const DataGrid = styled(BottomContainer)`
  display: grid;
  grid-template-columns: 5fr 5fr 5fr 5fr 4fr 4fr 4fr;
  justify-content: space-between;
`;

const { ENTITY_SETS_BY_ORG } = APP_DATA;
const { PSA_NEIGHBORS_BY_ID } = REVIEW_DATA;
const { PEOPLE_NEIGHBORS_BY_ID } = PEOPLE_DATA;
const { GET_PEOPLE_NEIGHBORS } = PEOPLE_ACTIONS;

const { getEntityKeyId } = DataUtils;
const { isPending, isSuccess } = ReduxUtils;

const {
  ASSESSED_BY,
  CHARGES,
  FTAS,
  MANUAL_PRETRIAL_CASES,
  PEOPLE,
  PRETRIAL_CASES,
  PSA_SCORES,
  SENTENCES,
  STAFF,
} = APP_TYPES;

const {
  ARREST_DATE_TIME,
  CASE_ID,
  DATE_TIME,
  ENTITY_KEY_ID,
  FIRST_NAME,
  FTA_SCALE,
  LAST_NAME,
  NCA_SCALE,
  NVCA_FLAG,
  MIDDLE_NAME,
  PERSON_ID
} = PROPERTY_TYPES;

type Props = {
  result :Map;
}

const PSAResult = (props :Props) => {
  const { result: psa } = props;
  const flags = [];
  const esidsToAppType = useSelector((store) => getIn(store, [STATE.APP, ENTITY_SETS_BY_ORG], Map()));
  const getPeopleNeighborsRS = useSelector((store) => store.getIn(
    [STATE.PEOPLE, REDUX.ACTIONS, GET_PEOPLE_NEIGHBORS, REQUEST_STATE])
  );
  const getPSANeighborsRS = useSelector((store) => store.getIn([STATE.REVIEW, LOAD_PSA_DATA, REQUEST_STATE]));
  const psaEKID = getEntityKeyId(psa);
  const nvca = getIn(psa, [NVCA_FLAG, 0], '');
  const nca = getIn(psa, [NCA_SCALE, 0], '');
  const fta = getIn(psa, [FTA_SCALE, 0], '');
  const psaDate = DateTime.fromISO(getIn(psa, [DATE_TIME, 0], ''));
  const psaNeighbors = useSelector((store) => getIn(store, [STATE.REVIEW, PSA_NEIGHBORS_BY_ID, psaEKID], Map()));
  const staff = get(psaNeighbors, STAFF, Map());
  const manualPretrialCase = get(psaNeighbors, MANUAL_PRETRIAL_CASES, Map());
  const { [CASE_ID]: currentCaseNumber } = getEntityProperties(manualPretrialCase, [CASE_ID]);
  const person = get(psaNeighbors, PEOPLE, Map());
  const {
    [ENTITY_KEY_ID]: personEKID,
    [FIRST_NAME]: firstName,
    [LAST_NAME]: lastName,
    [MIDDLE_NAME]: middleName,
    [PERSON_ID]: id,
  } = getEntityProperties(person, [ENTITY_KEY_ID, FIRST_NAME, LAST_NAME, MIDDLE_NAME, PERSON_ID]);
  const personNeighbors = useSelector((store) => getIn(store, [STATE.PEOPLE, PEOPLE_NEIGHBORS_BY_ID, personEKID], Map()));
  const allPSAs = get(personNeighbors, PSA_SCORES, List());
  const allCases = get(personNeighbors, PRETRIAL_CASES, List());
  const allCharges = get(personNeighbors, CHARGES, List());
  const allSentences = get(personNeighbors, SENTENCES, List());

  if (allPSAs.size > 1) flags.push(<Tag mode="info">{`${allPSAs.size} Open PSAs`}</Tag>)

  const ftas = personNeighbors.get(FTAS, List());
  const hasFTASincePSA = ftas.some((fta) => {
    const ftaDateTime = DateTime.fromISO(getIn(fta, [DATE_TIME, 0], ''));
    if (psaDate.isValid) {
      // $FlowFixMe
      return psaDate < ftaDateTime;
    }
    return false;
  });

  if (hasFTASincePSA) flags.push(<Tag mode="danger">Recent FTA</Tag>)

  const { [ARREST_DATE_TIME]: arrestDate } = getEntityProperties(manualPretrialCase, [ARREST_DATE_TIME]);

  let filer = '';
  staff.forEach((neighbor) => {
    const associationEntitySetId = getIn(neighbor, [PSA_ASSOCIATION.ENTITY_SET, 'id']);
    const appTypeFqn = get(esidsToAppType, associationEntitySetId);
    const { [PERSON_ID]: personId } = getEntityProperties(person, [PERSON_ID]);
    if (appTypeFqn === ASSESSED_BY) {
      filer = personId;
    }
  });

  const pendingCharges = getPendingCharges(
    currentCaseNumber,
    arrestDate,
    allCases,
    allCharges,
    allSentences,
  );

  if (!pendingCharges.size) flags.push(<Tag mode="secondary">No Pending Charges</Tag>)

  const numberOfPendingCharges = pendingCharges;

  const data = {
    First: firstName,
    Middle: middleName,
    Last: lastName,
    ID: id,
    NCA: <ScoreScale score={nca} />,
    FTA: <ScoreScale score={fta} />,
    NVCA: <BooleanFlag value={nvca} />
  };

  return (
    <>
    <Card>
      <DataGrid key={psaEKID}>
        {
          Object.entries(data).map(([key, value]) => (
            <Data>
              <Label>{key}</Label>
              {isPending(getPSANeighborsRS) ? <Skeleton/> : value}
            </Data>
          ))
        }
      </DataGrid>
      <BottomContainer>
      {
        isPending(getPeopleNeighborsRS) && <Skeleton width="100%"/>
      }
      {
        (isSuccess(getPeopleNeighborsRS) && flags.length > 0) && (
          <FlagContainer>{flags}</FlagContainer>
        )
      }
        <PSAMetaData
            entitySetIdsToAppType={esidsToAppType}
            psaNeighbors={psaNeighbors}
            scores={psa} />
    </BottomContainer>
    </Card>
    </>
  );
};

export default PSAResult;
