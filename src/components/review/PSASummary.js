/*
 * @flow
 */
import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import PSAStats from './PSAStats';
import ContentBlock from '../ContentBlock';
import PersonCardSummary from '../person/PersonCardSummary';
import ArrestCard from '../arrest/ArrestCard';
import PSAReportDownloadButton from './PSAReportDownloadButton';
import DMFCell from '../dmf/DMFCell';
import ChargeTable from '../../components/charges/ChargeTable';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { formatDMFFromEntity } from '../../utils/consts/DMFResultConsts';
import { formatDateTimeList } from '../../utils/Utils';
import {
  stepTwoIncrease,
  stepFourIncrease,
  dmfSecondaryReleaseDecrease
} from '../../utils/ScoringUtils';

const SummaryWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0px -15px;

  hr {
    color: #eeeeee;
    width: 100%;
    height: 1px;
    margin: 0px;
  }
`;
const RowWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 66% 33%;
  margin: 30px 0px;
`;

const ScoresContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: ${props => (props.border ? 'solid 1px #eeeeee' : 'none')};
`;

const ScoreContent = styled.div`
  padding: 20px 30px 0px;
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const PSADetails = styled.div`
  margin-top: 20px;
  width: 100%;
  display: grid;
  grid-template-columns: 25% 25% 46%;
  grid-column-gap: 2%;
`;

const DownloadButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

const ScoreTitle = styled.div`
  width: 100%;
  font-family: 'Open Sans', sans-serif;
  padding: 0px 30px;
  font-size: 16px;
  font-weight: 600;
  color: #555e6f;
`;

const ChargeTableContainer = styled.div`
  text-align: center;
  width: 100%;
  margin: 0px;
`;

const StyledSectionHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  padding: 30px 0px 20px 30px;
  font-weight: 600;
  color: #555e6f;
`;

const Count = styled.div`
  height: fit-content;
  padding: 0px 10px;
  margin-left: 10px;
  border-radius: 10px;
  background-color: #f0f0f7;
  font-size: 12px;
  color: #8e929b;
`;

type Props = {
  scores :Immutable.Map<*, *>,
  neighbors :Immutable.Map<*, *>,
  manualCaseHistory :Immutable.List<*>,
  manualChargeHistory :Immutable.Map<*, *>,
  downloadFn :(values :{
    neighbors :Immutable.Map<*, *>,
    scores :Immutable.Map<*, *>
  }) => void,
};

const renderPersonInfo = ({ neighbors } :Props) => {
  const person = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map());

  return (
    <PersonCardSummary person={person} />
  );
};

const renderArrestInfo = ({ neighbors, manualCaseHistory } :Props) => {
  const caseNum = neighbors.getIn(
    [ENTITY_SETS.MANUAL_PRETRIAL_CASES, 'neighborDetails', PROPERTY_TYPES.CASE_ID, 0], ''
  );
  const pretrialCase = manualCaseHistory
    .filter(caseObj => caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0], '') === caseNum)
    .get(0);
  return (
    <ArrestCard arrest={pretrialCase} component="summary" />
  );
};

const renderCaseInfo = ({
  manualCaseHistory,
  manualChargeHistory,
  neighbors
} :Props) => {
  const caseNum = neighbors.getIn(
    [ENTITY_SETS.MANUAL_PRETRIAL_CASES, 'neighborDetails', PROPERTY_TYPES.CASE_ID, 0], ''
  );
  const pretrialCase = manualCaseHistory
    .filter(caseObj => caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0], '') === caseNum);
  const charges = manualChargeHistory.get(caseNum, Immutable.List());
  return (
    <ChargeTableContainer>
      <StyledSectionHeader>
        Charges
        <Count>{charges.size}</Count>
      </StyledSectionHeader>
      <ChargeTable charges={charges} pretrialCase={pretrialCase} />
    </ChargeTableContainer>
  );
};

const renderPSADetails = ({ neighbors, downloadFn, scores } :Props) => {
  let filer;
  const psaDate = formatDateTimeList(
    neighbors.getIn([ENTITY_SETS.PSA_RISK_FACTORS, 'associationDetails', PROPERTY_TYPES.TIMESTAMP], Immutable.Map())
  );
  neighbors.get(ENTITY_SETS.STAFF, Immutable.List()).forEach((neighbor) => {
    const associationEntitySetName = neighbor.getIn(['associationEntitySet', 'name']);
    const personId = neighbor.getIn(['neighborDetails', PROPERTY_TYPES.PERSON_ID, 0], '');
    if (associationEntitySetName === ENTITY_SETS.ASSESSED_BY) {
      filer = personId;
    }
  });
  return (
    <PSADetails>
      <ContentBlock
          contentBlock={{ label: 'psa date', content: [psaDate] }}
          component="summary" />
      <ContentBlock
          contentBlock={{ label: 'filer', content: [filer] }}
          component="summary" />
      <DownloadButtonWrapper>
        <PSAReportDownloadButton
            downloadFn={downloadFn}
            neighbors={neighbors}
            scores={scores} />
      </DownloadButtonWrapper>
    </PSADetails>
  );
};

const PSASummary = (props :Props) => {
  const { neighbors, scores } = props;
  const dmfRiskFactors = neighbors.getIn([ENTITY_SETS.DMF_RISK_FACTORS, 'neighborDetails'], Immutable.Map());
  const psaRiskFactors = neighbors.getIn([ENTITY_SETS.PSA_RISK_FACTORS, 'neighborDetails'], Immutable.Map());
  const dmfEntity = neighbors.getIn([ENTITY_SETS.DMF_RESULTS, 'neighborDetails'], Immutable.Map());
  const dmf = formatDMFFromEntity(dmfEntity);


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
    <SummaryWrapper>
      <RowWrapper>
        {renderPersonInfo(props)}
        {renderArrestInfo(props)}
      </RowWrapper>
      <hr />
      <RowWrapper>
        <ScoresContainer border>
          <ScoreTitle>PSA</ScoreTitle>
          <ScoreContent>
            <PSAStats scores={scores} />
            {renderPSADetails(props)}
          </ScoreContent>
        </ScoresContainer>
        <ScoresContainer>
          <ScoreTitle>DMF</ScoreTitle>
          <ScoreContent>
            <DMFCell dmf={dmf} selected />
          </ScoreContent>
        </ScoresContainer>
      </RowWrapper>
      <hr />
      {renderCaseInfo(props)}
    </SummaryWrapper>
  );
};

export default PSASummary;
