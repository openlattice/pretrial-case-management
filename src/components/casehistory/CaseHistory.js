/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import ChargeHistoryStats from './ChargeHistoryStats';
import CaseHistoryList from './CaseHistoryList';

const CaseHistoryWrapper = styled.div`
  hr {
    margin: ${(props :Object) => (props.modal ? '30px -30px' : '15px 0')};
    width: ${(props :Object) => (props.modal ? 'calc(100% + 60px)' : '100%')};
  }
`;

type Props = {
  addCaseToPSA :() => void;
  caseHistoryForMostRecentPSA :List;
  caseHistoryNotForMostRecentPSA :List;
  caseNumbersToAssociationId :Map;
  chargeHistoryForMostRecentPSA :Map;
  chargeHistoryNotForMostRecentPSA :Map;
  loading :boolean;
  modal :boolean;
  personNeighbors :Map;
  psaNeighbors :Map;
  psaPermissions :boolean;
  removeCaseFromPSA :() => void;
};

const CaseHistory = ({
  addCaseToPSA,
  caseHistoryForMostRecentPSA,
  caseHistoryNotForMostRecentPSA,
  caseNumbersToAssociationId,
  chargeHistoryForMostRecentPSA,
  chargeHistoryNotForMostRecentPSA,
  loading,
  modal,
  personNeighbors,
  psaNeighbors,
  psaPermissions,
  removeCaseFromPSA
} :Props) => {

  return (
    <CaseHistoryWrapper modal={modal}>
      <ChargeHistoryStats
          personNeighbors={personNeighbors}
          psaNeighbors={psaNeighbors} />
      <CaseHistoryList
          addCaseToPSA={addCaseToPSA}
          caseHistory={caseHistoryForMostRecentPSA}
          caseNumbersToAssociationId={caseNumbersToAssociationId}
          chargeHistory={chargeHistoryForMostRecentPSA}
          loading={loading}
          modal={modal}
          pendingCases
          psaPermissions={psaPermissions}
          removeCaseFromPSA={removeCaseFromPSA}
          title="Pending Cases on Arrest Date for Current PSA" />
      <CaseHistoryList
          caseHistory={caseHistoryNotForMostRecentPSA}
          chargeHistory={chargeHistoryNotForMostRecentPSA}
          loading={loading}
          modal={modal}
          title="Case History" />
    </CaseHistoryWrapper>
  );
};

export default CaseHistory;
