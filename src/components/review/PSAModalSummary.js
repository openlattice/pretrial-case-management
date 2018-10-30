/*
 * @flow
 */
import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import ChargeHistoryStats from '../casehistory/ChargeHistoryStats';
import ChargeTable from '../charges/ChargeTable';
import PSASummary from './PSASummary';
import { AlternateSectionHeader, PendingChargeStatus, Count } from '../../utils/Layout';
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

const StyledChargeStatus = styled(PendingChargeStatus)`
    position: relative;
    transform: translateX(400px) translateY(50px);
`;

type Props = {
  notes :string,
  scores :Immutable.Map<*, *>,
  neighbors :Immutable.Map<*, *>,
  manualCaseHistory :Immutable.List<*>,
  chargeHistory :Immutable.List<*>,
  manualChargeHistory :Immutable.Map<*, *>,
  pendingCharges :Immutable.List<*>,
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
        <AlternateSectionHeader>
          Charges
          <Count>{charges.size}</Count>
        </AlternateSectionHeader>
        <ChargeTable charges={charges} pretrialCase={pretrialCase} />
      </ChargeTableContainer>
    );
  }

  renderPendingChargeStatus = () => {
    const { pendingCharges } = this.props;
    const statusText = pendingCharges.size
      ? `${pendingCharges.size} Pending Charge${pendingCharges.size > 1 ? 's' : ''}`
      : 'No Pending Charges';
    return (
      <StyledChargeStatus pendingCharges={pendingCharges.size}>
        {statusText}
      </StyledChargeStatus>
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
        {(chargeHistory.size) ? this.renderPendingChargeStatus() : null}
        <ChargeHistoryStats padding chargeHistory={chargeHistory} />
        {this.renderCaseInfo()}
      </SummaryWrapper>
    );
  }
}

export default PSAModalSummary;
