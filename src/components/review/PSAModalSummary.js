/*
 * @flow
 */
import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import ChargeHistoryStats from '../casehistory/ChargeHistoryStats';
import ChargeTable from '../charges/ChargeTable';
import PSASummary from './PSASummary';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';

const SummaryWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  color: ${OL.GREY01};
`;

const Count = styled.div`
  height: fit-content;
  padding: 0 10px;
  margin-left: 10px;
  border-radius: 10px;
  background-color: ${OL.GREY08};
  font-size: 12px;
  color: ${OL.GREY02};
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

class PSAModalSummary extends React.Component<Props, *> {

  renderCaseInfo = () => {
    const {
      manualCaseHistory,
      manualChargeHistory,
      neighbors
    } = this.props;
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
  }

  render() {
    const {
      scores,
      notes,
      chargeHistory,
      neighbors,
      manualCaseHistory,
      downloadFn
    } = this.props;

    return (
      <SummaryWrapper>
        <PSASummary
            notes={notes}
            scores={scores}
            neighbors={neighbors}
            manualCaseHistory={manualCaseHistory}
            downloadFn={downloadFn} />
        <ChargeHistoryStats padding chargeHistory={chargeHistory} />
        {this.renderCaseInfo()}
      </SummaryWrapper>
    );
  }
}

export default PSAModalSummary;
