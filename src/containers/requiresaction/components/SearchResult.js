/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import {
  List,
  Map,
  get,
  getIn
} from 'immutable';
import {
  Card,
  Label,
  Skeleton,
  Tag
} from 'lattice-ui-kit';
import { DataUtils, ReduxUtils } from 'lattice-utils';
import { DateTime } from 'luxon';
import { useSelector } from 'react-redux';

import ActionButton from '../ActionButton';
import BooleanFlag from '../../../components/BooleanFlag';
import PSAMetaData from '../../../components/review/PSAMetaData';
import REVIEW_DATA from '../../../utils/consts/redux/ReviewConsts';
import ScoreScale from '../../../components/ScoreScale';
import { REQUEST_STATE } from '../../../core/redux/constants';
import { getPendingCharges } from '../../../utils/AutofillUtils';
import { getEntityProperties } from '../../../utils/DataUtils';
import { getPersonNameString } from '../../../utils/PeopleUtils';
import { PSA_STATUSES } from '../../../utils/consts/Consts';
import { APP_TYPES, PROPERTY_TYPES } from '../../../utils/consts/DataModelConsts';
import { APP_DATA } from '../../../utils/consts/redux/AppConsts';
import { PEOPLE_ACTIONS, PEOPLE_DATA } from '../../../utils/consts/redux/PeopleConsts';
import { REDUX, STATE } from '../../../utils/consts/redux/SharedConsts';
import { LOAD_PSA_DATA } from '../../review/ReviewActions';
import { LOAD_REQUIRES_ACTION } from '../actions';

const Data = styled.div`
  display: flex;
  flex-direction: column;
  white-space: nowrap;
`;

const BottomContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;

  > div:first-child {
    width: min-content;
  }
`;

const FlexContainer = styled.div`
  display: flex;
`;

const BlockContainer = styled.div`
  display: block;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BottomSubContainer = styled.div`
  align-items: center;
  display: flex;
  width: 100%;
`;

const DataGrid = styled(BottomContainer)`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: 4fr 3fr 3fr 3fr 3fr 3fr 1fr;
  justify-content: space-between;
`;

const { ENTITY_SETS_BY_ORG } = APP_DATA;
const { PSA_NEIGHBORS_BY_ID } = REVIEW_DATA;
const { PEOPLE_NEIGHBORS_BY_ID } = PEOPLE_DATA;
const { GET_PEOPLE_NEIGHBORS } = PEOPLE_ACTIONS;

const { getEntityKeyId } = DataUtils;
const { isPending, isSuccess } = ReduxUtils;

const {
  CHARGES,
  FTAS,
  MANUAL_PRETRIAL_CASES,
  OUTCOMES,
  PEOPLE,
  PRETRIAL_CASES,
  PSA_SCORES,
  SENTENCES,
} = APP_TYPES;

const {
  ARREST_DATE_TIME,
  CASE_ID,
  DATE_TIME,
  DOB,
  ENTITY_KEY_ID,
  FTA_SCALE,
  NCA_SCALE,
  NVCA_FLAG,
  PERSON_ID,
  STATUS
} = PROPERTY_TYPES;

const STATUS_MODE = {
  [PSA_STATUSES.OPEN]: 'primary',
  [PSA_STATUSES.SUCCESS]: 'success',
  [PSA_STATUSES.FAILURE]: 'danger',
  [PSA_STATUSES.CANCELLED]: undefined,
  [PSA_STATUSES.DECLINED]: undefined,
  [PSA_STATUSES.DISMISSED]: undefined,
};

type Props = {
  result :Map;
}

const PSAResult = (props :Props) => {
  const { result: psa } = props;
  const flags = [];
  const esidsToAppType = useSelector((store) => getIn(store, [STATE.APP, ENTITY_SETS_BY_ORG], Map()));
  const loadRequiresActionRS = useSelector((store) => store
    .getIn([STATE.REQUIRES_ACTION, LOAD_REQUIRES_ACTION, REQUEST_STATE]));
  const getPSANeighborsRS = useSelector((store) => store.getIn([STATE.REVIEW, LOAD_PSA_DATA, REQUEST_STATE]));
  const getPeopleNeighborsRS = useSelector((store) => store.getIn(
    [STATE.PEOPLE, REDUX.ACTIONS, GET_PEOPLE_NEIGHBORS, REQUEST_STATE]
  ));

  const loadingRequiresAction = isPending(loadRequiresActionRS);
  const psaNeighborsLoading = isPending(getPSANeighborsRS);
  const peopleNeighborsLoading = isPending(getPeopleNeighborsRS);
  const psaEKID :UUID = getEntityKeyId(psa) || '';
  const status = getIn(psa, [STATUS, 0], '');
  const nvca = getIn(psa, [NVCA_FLAG, 0], '');
  const nca = getIn(psa, [NCA_SCALE, 0], '');
  const ftaScore = getIn(psa, [FTA_SCALE, 0], '');
  const psaDate = DateTime.fromISO(getIn(psa, [DATE_TIME, 0], ''));
  const psaNeighbors = useSelector((store) => getIn(store, [STATE.REVIEW, PSA_NEIGHBORS_BY_ID, psaEKID], Map()));
  const manualPretrialCase = get(psaNeighbors, MANUAL_PRETRIAL_CASES, Map());
  const psaOutcome = get(psaNeighbors, OUTCOMES, Map());
  const { [CASE_ID]: currentCaseNumber } = getEntityProperties(manualPretrialCase, [CASE_ID]);
  const person = get(psaNeighbors, PEOPLE, Map());
  const {
    [DOB]: dob,
    [ENTITY_KEY_ID]: personEKID,
    [PERSON_ID]: id,
  } = getEntityProperties(person, [DOB, ENTITY_KEY_ID, PERSON_ID]);
  const personName = getPersonNameString(person);
  const personNeighbors = useSelector((store) => getIn(
    store, [STATE.PEOPLE, PEOPLE_NEIGHBORS_BY_ID, personEKID], Map()
  ));
  const allOpenPSAs = get(personNeighbors, PSA_SCORES, List()).filter((scores) => {
    const psaStatus = getIn(scores, [STATUS, 0], '');
    return psaStatus === PSA_STATUSES.OPEN;
  });
  const allCases = get(personNeighbors, PRETRIAL_CASES, List());
  const allCharges = get(personNeighbors, CHARGES, List());
  const allSentences = get(personNeighbors, SENTENCES, List());

  const ftas = personNeighbors.get(FTAS, List());
  const hasFTASincePSA = ftas.some((fta) => {
    const ftaDateTime = DateTime.fromISO(getIn(fta, [DATE_TIME, 0], ''));
    if (psaDate.isValid) {
      // $FlowFixMe
      return psaDate < ftaDateTime;
    }
    return false;
  });

  const { [ARREST_DATE_TIME]: arrestDate } = getEntityProperties(manualPretrialCase, [ARREST_DATE_TIME]);

  const pendingCharges = getPendingCharges(
    currentCaseNumber,
    arrestDate,
    allCases,
    allCharges,
    allSentences,
  );

  if (psaOutcome.size > 1) flags.push(<Tag mode="success">Has Outcome</Tag>);
  if (allOpenPSAs.size > 1) flags.push(<Tag mode="info">{`${allOpenPSAs.size} Open PSAs`}</Tag>);
  if (hasFTASincePSA) flags.push(<Tag mode="danger">Recent FTA</Tag>);
  if (!pendingCharges.size) flags.push(<Tag mode="secondary">No Pending Charges</Tag>);

  const data = {
    Name: personName,
    'Date of Birth': dob,
    ID: <BlockContainer>{id}</BlockContainer>,
    NCA: <FlexContainer>{nca}<ScoreScale score={nca} /></FlexContainer>,
    FTA: <FlexContainer>{ftaScore}<ScoreScale score={ftaScore} /></FlexContainer>,
    NVCA: <FlexContainer>{nvca}<BooleanFlag value={nvca} /></FlexContainer>
  };

  return (
    <Card>
      <DataGrid key={psaEKID}>
        {
          Object.entries(data).map(([key, value]) => (
            <Data>
              <Label>{key}</Label>
              {(loadingRequiresAction || psaNeighborsLoading) ? <Skeleton /> : value}
            </Data>
          ))
        }
        <ActionButton
            isLoading={loadingRequiresAction || psaNeighborsLoading || peopleNeighborsLoading}
            personEKID={personEKID}
            psaEKID={psaEKID}
            psaNeighbors={psaNeighbors}
            scores={psa} />
      </DataGrid>
      <BottomContainer>
        {
          !loadingRequiresAction && (
            <BottomSubContainer><Tag mode={STATUS_MODE[status]}>{status}</Tag></BottomSubContainer>
          )
        }
        {
          (loadingRequiresAction || peopleNeighborsLoading) && <Skeleton width="100%" />
        }
        {
          (!loadingRequiresAction && isSuccess(getPeopleNeighborsRS) && flags.length > 0) && (
            <BottomSubContainer>{flags}</BottomSubContainer>
          )
        }
        <BottomSubContainer>
          {
            !loadingRequiresAction && (
              <PSAMetaData
                  entitySetIdsToAppType={esidsToAppType}
                  psaNeighbors={psaNeighbors}
                  scores={psa} />
            )
          }
        </BottomSubContainer>
      </BottomContainer>
    </Card>
  );
};

export default PSAResult;
