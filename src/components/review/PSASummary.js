/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import PSAScores from './PSAScores';
import DMFCell from '../dmf/DMFCell';
import ChargeList from '../../components/charges/ChargeList';
import { CenteredContainer } from '../../utils/Layout';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { formatDMFFromEntity } from '../../utils/consts/DMFResultConsts';
import { formatValue, formatDateList, formatDateTimeList } from '../../utils/Utils';
import {
  stepTwoIncrease,
  stepFourIncrease,
  dmfSecondaryReleaseDecrease
} from '../../utils/ScoringUtils';

const ScoresContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
`;

const SummaryScores = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  text-align: center;
`;

const ScoreTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const DMFIncreaseText = styled.div`
  margin: 5px;
  font-weight: bold;
`;

const InfoRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 15px 0;
`;

const InfoItem = styled.div`
  margin: 0 20px;
`;

const InfoHeader = styled.span`
  font-weight: bold;
`;

const DateContainer = styled.div`
  font-style: italic;
  margin: 15px;
`;

type Props = {
  scores :Immutable.Map<*, *>,
  neighbors :Immutable.Map<*, *>,
  manualCaseHistory :Immutable.List<*>,
  manualChargeHistory :Immutable.Map<*, *>
};

const renderPersonInfo = (neighbors) => {
  const person = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map());
  const firstName = formatValue(person.get(PROPERTY_TYPES.FIRST_NAME));
  const middleName = formatValue(person.get(PROPERTY_TYPES.MIDDLE_NAME));
  const lastName = formatValue(person.get(PROPERTY_TYPES.LAST_NAME));
  const dob = formatDateList(person.get(PROPERTY_TYPES.DOB));
  const sex = formatValue(person.get(PROPERTY_TYPES.SEX));
  const race = formatValue(person.get(PROPERTY_TYPES.RACE));

  return (
    <div>
      <InfoRow>
        <InfoItem><InfoHeader>First Name: </InfoHeader>{firstName}</InfoItem>
        <InfoItem><InfoHeader>Middle Name: </InfoHeader>{middleName}</InfoItem>
        <InfoItem><InfoHeader>Last Name: </InfoHeader>{lastName}</InfoItem>
      </InfoRow>
      <InfoRow>
        <InfoItem><InfoHeader>Date of Birth: </InfoHeader>{dob}</InfoItem>
        <InfoItem><InfoHeader>Gender: </InfoHeader>{sex}</InfoItem>
        <InfoItem><InfoHeader>Race: </InfoHeader>{race}</InfoItem>
      </InfoRow>
    </div>
  );
};

const renderCaseInfo = ({
  manualCaseHistory,
  manualChargeHistory,
  neighbors
} :Props) => {
  const caseNum = neighbors.getIn(
    [ENTITY_SETS.MANUAL_PRETRIAL_CASES, 'neighborDetails', PROPERTY_TYPES.CASE_ID, 0],
    ''
  );
  const pretrialCase = manualCaseHistory
    .filter(caseObj => caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0], '') === caseNum);
  const charges = manualChargeHistory.get(caseNum, Immutable.List());
  const arrestDate = formatDateTimeList(pretrialCase.getIn([0, PROPERTY_TYPES.ARREST_DATE_TIME], Immutable.List()));

  return (
    <CenteredContainer>
      { arrestDate.length ? <DateContainer>{`Arrest Date: ${arrestDate}`}</DateContainer> : null }
      <ChargeList pretrialCaseDetails={pretrialCase} charges={charges} />
    </CenteredContainer>
  );
};

const PSASummary = (props :Props) => {
  const { neighbors, scores } = props;
  const dmfRiskFactors = neighbors.getIn([ENTITY_SETS.DMF_RISK_FACTORS, 'neighborDetails'], Immutable.Map());
  const psaRiskFactors = neighbors.getIn([ENTITY_SETS.PSA_RISK_FACTORS, 'neighborDetails'], Immutable.Map());
  const dmfEntity = neighbors.getIn([ENTITY_SETS.DMF_RESULTS, 'neighborDetails'], Immutable.Map());
  const dmf = formatDMFFromEntity(dmfEntity);

  const psaDate = formatDateTimeList(
    neighbors.getIn([ENTITY_SETS.PSA_RISK_FACTORS, 'associationDetails', PROPERTY_TYPES.TIMESTAMP], Immutable.Map())
  );

  let modificationText;
  if (stepTwoIncrease(dmfRiskFactors, psaRiskFactors, scores)) {
    modificationText = 'Step two increase.';
  }
  else if (stepFourIncrease(dmfRiskFactors, psaRiskFactors, scores)) {
    modificationText = 'Step four increase.';
  }
  else if (dmfSecondaryReleaseDecrease(dmfRiskFactors, scores)) {
    modificationText = 'Exception release.';
  }
  return (
    <div>
      {renderPersonInfo(neighbors)}
      <hr />
      <CenteredContainer>
        { psaDate.length ? <DateContainer>{`PSA Date: ${psaDate}`}</DateContainer> : null }
        <SummaryScores>
          <ScoresContainer>
            <ScoreTitle>PSA:</ScoreTitle>
            <PSAScores scores={scores} />
          </ScoresContainer>
          <ScoresContainer>
            <ScoreTitle>DMF:</ScoreTitle>
            <DMFIncreaseText>{modificationText}</DMFIncreaseText>
            <DMFCell dmf={dmf} selected />
          </ScoresContainer>
        </SummaryScores>
      </CenteredContainer>
      <hr />
      {renderCaseInfo(props)}
    </div>
  );
};

export default PSASummary;
