/*
 * @flow
 */
import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import ArrestCard from '../arrest/ArrestCard';
import ChargeHistoryStats from '../casehistory/ChargeHistoryStats';
import ChargeTable from '../../components/charges/ChargeTable';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import ContentBlock from '../ContentBlock';
import DMFCell from '../dmf/DMFCell';
import PersonCardSummary from '../person/PersonCardSummary';
import PSAReportDownloadButton from './PSAReportDownloadButton';
import PSAStats from './PSAStats';
import rightArrow from '../../assets/svg/dmf-arrow.svg';
import { Title } from '../../utils/Layout';
import { CONTEXT } from '../../utils/consts/Consts';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR, PSA_ASSOCIATION } from '../../utils/consts/FrontEndStateConsts';
import {
  getDMFDecision,
  increaseDMFSeverity,
  formatDMFFromEntity
} from '../../utils/DMFUtils';
import { formatDateTimeList } from '../../utils/FormattingUtils';
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

  img {
    margin: 3px;
  }
`;

const NotesWrapper = styled.div`
  width: 100%;
  padding: 0 30px 30px;
`;

const DMFIncreaseText = styled.div`
  margin-bottom: 15px;
  font-size: 14px;
  color: black;
  text-transform: uppercase;
  text-align: center;
  width: 100%;
`;

type Props = {
  notes :string,
  scores :Immutable.Map<*, *>,
  neighbors :Immutable.Map<*, *>,
  manualCaseHistory :Immutable.List<*>,
  chargeHistory :Immutable.List<*>,
  manualChargeHistory :Immutable.Map<*, *>,
  downloadFn :(values :{
    neighbors :Immutable.Map<*, *>,
    scores :Immutable.Map<*, *>
  }) => void,
};

const renderNotes = ({ notes } :Props) => (
  <NotesWrapper>
    <Title withSubtitle ><span>Notes</span></Title>
    {notes}
  </NotesWrapper>
);

const renderPersonInfo = ({ neighbors } :Props) => {
  const person = neighbors.getIn([ENTITY_SETS.PEOPLE, PSA_NEIGHBOR.DETAILS], Immutable.Map());

  return (
    <PersonCardSummary person={person} />
  );
};

const renderArrestInfo = ({ neighbors, manualCaseHistory } :Props) => {
  const caseNum = neighbors.getIn(
    [ENTITY_SETS.MANUAL_PRETRIAL_CASES, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CASE_ID, 0], ''
  );
  const pretrialCase = manualCaseHistory
    .filter(caseObj => caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0], '') === caseNum)
    .get(0, Immutable.Map());
  return (
    <ArrestCard arrest={pretrialCase} component={CONTENT_CONSTS.ARREST} />
  );
};

const renderCaseInfo = ({
  manualCaseHistory,
  manualChargeHistory,
  neighbors
} :Props) => {
  const caseNum = neighbors.getIn(
    [ENTITY_SETS.MANUAL_PRETRIAL_CASES, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CASE_ID, 0], ''
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
    neighbors.getIn([ENTITY_SETS.PSA_RISK_FACTORS, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.TIMESTAMP], Immutable.Map())
  );
  neighbors.get(ENTITY_SETS.STAFF, Immutable.List()).forEach((neighbor) => {
    const associationEntitySetName = neighbor.getIn([PSA_ASSOCIATION.ENTITY_SET, 'name']);
    const personId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID, 0], '');
    if (associationEntitySetName === ENTITY_SETS.ASSESSED_BY) {
      filer = personId;
    }
  });
  return (
    <PSADetails>
      <ContentBlock
          contentBlock={{ label: 'psa date', content: [psaDate] }}
          component={CONTENT_CONSTS.SUMMARY} />
      <ContentBlock
          contentBlock={{ label: 'filer', content: [filer] }}
          component={CONTENT_CONSTS.SUMMARY} />
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
  const dmfRiskFactors = neighbors.getIn([ENTITY_SETS.DMF_RISK_FACTORS, PSA_NEIGHBOR.DETAILS], Immutable.Map());
  let context = dmfRiskFactors.getIn([PROPERTY_TYPES.CONTEXT, 0]);
  if (context === 'Court') {
    context = CONTEXT.COURT_PENN;
  }
  const psaRiskFactors = neighbors.getIn([ENTITY_SETS.PSA_RISK_FACTORS, PSA_NEIGHBOR.DETAILS], Immutable.Map());
  const dmfEntity = neighbors.getIn([ENTITY_SETS.DMF_RESULTS, PSA_NEIGHBOR.DETAILS], Immutable.Map());
  const dmf = formatDMFFromEntity(dmfEntity);
  const nca = scores.getIn([PROPERTY_TYPES.NCA_SCALE, 0]);
  const fta = scores.getIn([PROPERTY_TYPES.FTA_SCALE, 0]);
  const dmfDecision = getDMFDecision(nca, fta, context);

  if (stepTwoIncrease(dmfRiskFactors, psaRiskFactors, scores)) {
    return (
      <ScoreContent>
        <DMFIncreaseText>Step two increase</DMFIncreaseText>
        <DMFCell dmf={dmf} selected large />
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
  return (
    <ScoreContent>
      <DMFCell dmf={dmf} selected large />
    </ScoreContent>
  );
};

const PSASummary = (props :Props) => {
  const { scores } = props;
  const { chargeHistory } = props;
  console.log(props.neighbors.toJS());


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
      {props.notes ? renderNotes(props) : null}
      {props.notes ? <hr /> : null}
      <ChargeHistoryStats padding chargeHistory={chargeHistory} />
      {renderCaseInfo(props)}
    </SummaryWrapper>
  );
};

export default PSASummary;
