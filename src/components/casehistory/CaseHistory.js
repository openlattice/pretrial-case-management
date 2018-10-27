/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import ChargeHistoryStats from './ChargeHistoryStats';
import CaseHistoryList from './CaseHistoryList';
import { currentPendingCharges } from '../../utils/CaseUtils';
import { PendingChargeStatus } from '../../utils/Layout';

const CaseHistoryWrapper = styled.div`
  hr {
    margin: ${props => (props.modal ? '30px -30px' : '15px 0')};
    width: ${props => (props.modal ? 'calc(100% + 60px)' : '100%')};
  }
`;

const StyledChargeStatus = styled(PendingChargeStatus)`
    transform: translateX(765px) translateY(5px);
`;

type Props = {
  caseHistoryForMostRecentPSA :List<*>,
  chargeHistoryForMostRecentPSA :Map<*, *>,
  caseHistoryNotForMostRecentPSA :List<*>,
  chargeHistoryNotForMostRecentPSA :Map<*, *>,
  chargeHistory :Map<*, *>,
  loading :boolean,
  modal :boolean,
};

const CaseHistory = ({
  caseHistoryForMostRecentPSA,
  chargeHistoryForMostRecentPSA,
  caseHistoryNotForMostRecentPSA,
  chargeHistoryNotForMostRecentPSA,
  chargeHistory,
  loading,
  modal
} :Props) => {

  const renderPendingChargeStatus = () => {
    const pendingCharges = currentPendingCharges(chargeHistoryForMostRecentPSA).size;
    const statusText = pendingCharges
      ? `${pendingCharges} Pending Charges`
      : 'No Pending Charges';
    return (
      <StyledChargeStatus pendingCharges={pendingCharges}>
        {statusText}
      </StyledChargeStatus>
    );
  }

  return (
    <CaseHistoryWrapper modal={modal}>
      {(chargeHistory.size && !loading) ? renderPendingChargeStatus() : null}
      <ChargeHistoryStats chargeHistory={chargeHistory} />
      <CaseHistoryList
          loading={loading}
          title="Pending Cases on Arrest Date for Current PSA"
          caseHistory={caseHistoryForMostRecentPSA}
          chargeHistory={chargeHistoryForMostRecentPSA}
          modal={modal} />
      <CaseHistoryList
          loading={loading}
          title="Case History"
          caseHistory={caseHistoryNotForMostRecentPSA}
          chargeHistory={chargeHistoryNotForMostRecentPSA}
          modal={modal} />
    </CaseHistoryWrapper>
  )
};

export default CaseHistory;
