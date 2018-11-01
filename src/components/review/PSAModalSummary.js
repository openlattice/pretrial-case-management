/*
 * @flow
 */
import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import ChargeHistoryStats from '../casehistory/ChargeHistoryStats';
import ChargeTable from '../charges/ChargeTable';
import PSASummary from '../../containers/review/PSASummary';
import { AlternateSectionHeader, Count } from '../../utils/Layout';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
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

  render() {
    const {
      chargeHistory,
      downloadFn,
      manualCaseHistory,
      neighbors,
      notes,
      pendingCharges,
      scores
    } = this.props;

    return (
      <SummaryWrapper>
        <PSASummary
            notes={notes}
            scores={scores}
            neighbors={neighbors}
            manualCaseHistory={manualCaseHistory}
            downloadFn={downloadFn} />
        <ChargeHistoryStats
            padding
            pendingCharges={pendingCharges}
            chargeHistory={chargeHistory} />
        {this.renderCaseInfo()}
      </SummaryWrapper>
    );
  }
}

export default PSAModalSummary;
