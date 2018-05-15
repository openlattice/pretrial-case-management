/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import moment from 'moment';

import Headshot from '../Headshot';
import AboutPersonGeneral from '../person/AboutPersonGeneral';
import PSAScores from '../review/PSAScores';
import CaseHistory from '../review/CaseHistory';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { CenteredContainer } from '../../utils/Layout';

const Wrapper = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  height: 100%;
`;

const StyledColumnLeft = styled.div`
  display: flex;
  flex: 0 0 224px;
  flex-direction: column;
  margin-right: 30px;
  overflow: auto;
`;

const StyledColumnRight = styled.div`
  display: flex;
  flex: 1 1 564px;
  flex-direction: column;
  overflow: auto;
`;

const StyledColumnRightRowWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px;
  margin-bottom: 30px;
  width: 100%;
  background: white;
  border-radius: 5px;
`;

const StyledColumnRightRow = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
`;

const StyledSectionHeader = styled.div`
  font-size: 20px;
  color: #f7f8f9;
  background: #176a90;
  margin: -40px -40px 30px -40px;
  padding: 20px;
  border-radius: 5px 5px 0 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const MetadataText = styled.div`
  width: 100%;
  font-style: italic;
  font-size: 12px;
  color: #bbb;
  margin-bottom: 10px;
`;

const ImportantMetadataText = styled.span`
  color: black;
`;

type Props = {
  selectedPersonData :Immutable.Map<*, *>,
  neighbors :Immutable.Map<*, *>,
};

const AboutPerson = ({ selectedPersonData, neighbors } :Props) => {

  const getPSADate = (neighbor) => {
    return moment(neighbor.getIn(['associationDetails', PROPERTY_TYPES.TIMESTAMP, 0], ''));
  }

  const renderPSAs = () => {
    return neighbors.get(ENTITY_SETS.PSA_SCORES, Immutable.List())
      .sort((n1, n2) => {
        const m1 = getPSADate(n1);
        const m2 = getPSADate(n2);
        if (m1 && m2 && m1.isValid() && m2.isValid()) {
          if (m1.isBefore(m2)) return 1;
          if (m1.isAfter(m2)) return -1;
        }
        return 0;
      })
      .map((psaNeighbor) => {
        const dateCreated = getPSADate(psaNeighbor).format('MM/DD/YYYY hh:mm a');
        return (
          <CenteredContainer key={`${psaNeighbor.get('neighborId')}`}>
            <MetadataText>
              Created <ImportantMetadataText>{dateCreated}</ImportantMetadataText>
            </MetadataText>
            <PSAScores scores={psaNeighbor.get('neighborDetails', Immutable.Map())} />
          </CenteredContainer>
        );
      });
  };

  const renderCaseHistory = () => {
    const caseHistory = neighbors.get(ENTITY_SETS.PRETRIAL_CASES, Immutable.List())
      .concat(neighbors.get(ENTITY_SETS.MANUAL_PRETRIAL_CASES, Immutable.List()))
      .map(neighborObj => neighborObj.get('neighborDetails', Immutable.Map()));

    let chargeHistory = Immutable.Map();
    neighbors.get(ENTITY_SETS.CHARGES, Immutable.List())
      .concat(neighbors.get(ENTITY_SETS.MANUAL_CHARGES, Immutable.List()))
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
    return <CaseHistory caseHistory={caseHistory} chargeHistory={chargeHistory} />;
  };

  return (
    <Wrapper>
      <StyledColumnLeft>
        <Headshot
            photo={selectedPersonData.get(PROPERTY_TYPES.PICTURE)}
            size="180" />
      </StyledColumnLeft>
      <StyledColumnRight>
        <StyledColumnRightRowWrapper>
          <StyledSectionHeader>About</StyledSectionHeader>
          <StyledColumnRightRow>
            <AboutPersonGeneral selectedPersonData={selectedPersonData} />
          </StyledColumnRightRow>
        </StyledColumnRightRowWrapper>
        <StyledColumnRightRowWrapper>
          <StyledSectionHeader>PSA History</StyledSectionHeader>
          <StyledColumnRightRow>
            {renderPSAs()}
          </StyledColumnRightRow>
        </StyledColumnRightRowWrapper>
        <StyledColumnRightRowWrapper>
          <StyledSectionHeader>Case History</StyledSectionHeader>
          <StyledColumnRightRow>
            {renderCaseHistory()}
          </StyledColumnRightRow>
        </StyledColumnRightRowWrapper>
      </StyledColumnRight>
    </Wrapper>
  );
};

export default AboutPerson;
