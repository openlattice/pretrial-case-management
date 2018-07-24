/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import moment from 'moment';

import Headshot from '../Headshot';
import AboutPersonGeneral from '../person/AboutPersonGeneral';
import PSAReviewPersonRowList from '../../containers/review/PSAReviewReportsRowList';
import CaseHistory from '../casehistory/CaseHistory';
import CaseHistoryTimeline from '../casehistory/CaseHistoryTimeline';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { SORT_TYPES } from '../../utils/consts/Consts';
import { groupByStatus, sortByDate } from '../../utils/PSAUtils';

const Wrapper = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  height: 100%;
`;

const StyledColumn = styled.div`
  width: 960px;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

const StyledColumnRowWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 50px;
  max-width: 960px;
  background: white;
  border-radius: 5px;
`;

const StyledColumnRow = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  border-radius: 5px;
  background-color: #ffffff;
  border: solid 1px #e1e1eb;
`;

const StyledSectionHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-family: 'OpenSans', sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: #555e6f;
`;

const ReviewCount = styled.div`
  height: fit-content;
  padding: 0px 10px;
  margin-left: 10px;
  border-radius: 10px;
  background-color: #f0f0f7;
  font-size: 12px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: center;
  color: #8e929b;
`;

const Title = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  color: #555e6f;
  margin-bottom: 20px;
`;

type Props = {
  selectedPersonData :Immutable.Map<*, *>,
  neighbors :Immutable.Map<*, *>,
};

const AboutPerson = ({ selectedPersonData, neighbors } :Props) => {

  const renderHeaderSection = (numResults) => {
    return (
      <StyledSectionHeader>
        PSA History
        <ReviewCount>{numResults}</ReviewCount>
      </StyledSectionHeader>
    );
  }

  const renderPSAs = () => {
    const scoreSeq = neighbors.get(ENTITY_SETS.PSA_SCORES, Immutable.Map())
      .filter(neighbor => !!neighbor.get('neighborDetails'))
      .map(neighbor => [neighbor.get('neighborId'), neighbor.get('neighborDetails')]);

    return (
      <PSAReviewPersonRowList
          scoreSeq={scoreSeq}
          sort={SORT_TYPES.DATE}
          renderContent={renderHeaderSection}
          hideCaseHistory
          hideProfile />
    );
  };

  const renderCaseHistory = () => {
    const caseHistory = neighbors.get(ENTITY_SETS.PRETRIAL_CASES, Immutable.List())
      .map(neighborObj => neighborObj.get('neighborDetails', Immutable.Map()));

    let chargeHistory = Immutable.Map();
    neighbors.get(ENTITY_SETS.CHARGES, Immutable.List())
      .forEach((chargeNeighbor) => {
        const chargeIdArr = chargeNeighbor.getIn(['neighborDetails', PROPERTY_TYPES.CHARGE_ID, 0], '').split('|');
        if (chargeIdArr.length) {
          const caseId = chargeIdArr[0];
          chargeHistory = chargeHistory.set(
            caseId,
            chargeHistory.get(caseId, Immutable.List()).push(chargeNeighbor.get('neighborDetails', Immutable.Map()))
          );
        }
      });
    return (
      <div>
        <Title>Timeline (past two years)</Title>
        <CaseHistoryTimeline caseHistory={caseHistory} chargeHistory={chargeHistory} />
        <Title>All cases</Title>
        <CaseHistory caseHistory={caseHistory} chargeHistory={chargeHistory} />
      </div>
    );
  };

  return (
    <Wrapper>
      <StyledColumn>
        <StyledColumnRowWrapper>
          <StyledColumnRow>
            <AboutPersonGeneral selectedPersonData={selectedPersonData} />
          </StyledColumnRow>
        </StyledColumnRowWrapper>
        <StyledColumnRowWrapper>
          <StyledColumnRow>
            {renderPSAs()}
          </StyledColumnRow>
        </StyledColumnRowWrapper>
        <StyledColumnRowWrapper>
          <StyledSectionHeader>Case History</StyledSectionHeader>
          <StyledColumnRow>
            {renderCaseHistory()}
          </StyledColumnRow>
        </StyledColumnRowWrapper>
      </StyledColumn>
    </Wrapper>
  );
};

export default AboutPerson;
