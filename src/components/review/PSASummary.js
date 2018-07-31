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
import rightArrow from '../../assets/svg/dmf-arrow.svg';
import { CONTEXT } from '../../utils/consts/Consts';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  getDMFDecision,
  increaseDMFSeverity,
  formatDMFFromEntity
 } from '../../utils/consts/DMFResultConsts';
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

  hr {
    color: #eeeeee;
    width: 100%;
    height: 1px;
    margin: 0;
  }
`;

const RowWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 66% 33%;
  margin: 30px 0;
`;

const ScoresContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: ${props => (props.border ? 'solid 1px #eeeeee' : 'none')};
`;

const ScoreContent = styled.div`
  padding: 20px 30px 0;
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
  padding: 0 30px;
  font-size: 16px;
  font-weight: 600;
  color: #555e6f;
`;

const ChargeTableContainer = styled.div`
  text-align: center;
  width: 100%;
  margin: 0;
`;

const StyledSectionHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  padding: 30px 0 20px 30px;
  font-weight: 600;
  color: #555e6f;
`;

const Count = styled.div`
  height: fit-content;
  padding: 0 10px;
  margin-left: 10px;
  border-radius: 10px;
  background-color: #f0f0f7;
  font-size: 12px;
  color: #8e929b;
`;

const StepWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const DMFIncreaseText = styled.div`
margin-bottom: 15px;
font-size: 14px;
color: #555e6f;
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
    .get(0, Immutable.Map());
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

const renderDMFDetails = ({ neighbors, scores } :Props) => {
  const dmfRiskFactors = neighbors.getIn([ENTITY_SETS.DMF_RISK_FACTORS, 'neighborDetails'], Immutable.Map());
  let context = dmfRiskFactors.getIn(['general.context', 0]);
  if (context === 'Court') {
    context = CONTEXT.COURT_PENN;
  }
  const psaRiskFactors = neighbors.getIn([ENTITY_SETS.PSA_RISK_FACTORS, 'neighborDetails'], Immutable.Map());
  const dmfEntity = neighbors.getIn([ENTITY_SETS.DMF_RESULTS, 'neighborDetails'], Immutable.Map());
  const dmf = formatDMFFromEntity(dmfEntity);
  const nca = scores.getIn([PROPERTY_TYPES.NCA_SCALE, 0]);
  const fta = scores.getIn([PROPERTY_TYPES.FTA_SCALE, 0]);
  const dmfDecision = getDMFDecision(nca, fta, context);

  if (stepTwoIncrease(dmfRiskFactors, psaRiskFactors, scores)) {
    return (
      <ScoreContent>
        <DMFIncreaseText>Step two increase</DMFIncreaseText>
        <DMFCell dmf={dmf} selected />
      </ScoreContent>
    );
  }
  else if (stepFourIncrease(dmfRiskFactors, psaRiskFactors, scores)) {
    return (
      <ScoreContent>
        <DMFIncreaseText>Step four increase</DMFIncreaseText>
        <StepWrapper>
          <DMFCell dmf={dmfDecision} selected />
          <img src={rightArrow} alt="" />
          <DMFCell dmf={increaseDMFSeverity(dmfDecision, context)} selected />
        </StepWrapper>
      </ScoreContent>
    );
  }
  else if (dmfSecondaryReleaseDecrease(dmfRiskFactors, scores)) {
    return (
      <ScoreContent>
        <DMFIncreaseText>Step 5 Decrease</DMFIncreaseText>
        <StepWrapper>
          <DMFCell dmf={dmfDecision} selected />
          <img src={rightArrow} alt="" />
          <DMFCell dmf={dmf} selected />
        </StepWrapper>
      </ScoreContent>
    );
  }
};

const PSASummary = (props :Props) => {
  const { scores } = props;

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
          {renderDMFDetails(props)}
        </ScoresContainer>
      </RowWrapper>
      <hr />
      {renderCaseInfo(props)}
    </SummaryWrapper>
  );
};

export default PSASummary;
