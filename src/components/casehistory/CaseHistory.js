/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import ChargeHistoryStats from './ChargeHistoryStats';
import CaseHistoryList from './CaseHistoryList';
import { currentPendingCharges } from '../../utils/CaseUtils';

const CaseHistoryWrapper = styled.div`
  hr {
    margin: ${(props) => (props.modal ? '30px -30px' : '15px 0')};
    width: ${(props) => (props.modal ? 'calc(100% + 60px)' : '100%')};
  }
`;

type Props = {
  caseNumbersToAssociationId :Map<*, *>,
  caseHistoryForMostRecentPSA :List<*>,
  chargeHistoryForMostRecentPSA :Map<*, *>,
  caseHistoryNotForMostRecentPSA :List<*>,
  chargeHistoryNotForMostRecentPSA :Map<*, *>,
  chargeHistory :Map<*, *>,
  loading :boolean,
  modal :boolean,
  overview :boolean,
  psaPermissions :boolean,
  addCaseToPSA :() => void,
  removeCaseFromPSA :() => void,
};

const CaseHistory = ({
  caseNumbersToAssociationId,
  caseHistoryForMostRecentPSA,
  chargeHistoryForMostRecentPSA,
  caseHistoryNotForMostRecentPSA,
  chargeHistoryNotForMostRecentPSA,
  chargeHistory,
  loading,
  modal,
  overview,
  addCaseToPSA,
  psaPermissions,
  removeCaseFromPSA
} :Props) => {

  const pendingCharges = currentPendingCharges(chargeHistoryForMostRecentPSA);

  return (
    <CaseHistoryWrapper modal={modal}>
      { overview
        ? null
        : (
          <ChargeHistoryStats
              pendingCharges={pendingCharges}
              chargeHistory={chargeHistory} />
        )}
      <CaseHistoryList
          psaPermissions={psaPermissions}
          pendingCases
          addCaseToPSA={addCaseToPSA}
          removeCaseFromPSA={removeCaseFromPSA}
          caseNumbersToAssociationId={caseNumbersToAssociationId}
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
  );
};

export default CaseHistory;
