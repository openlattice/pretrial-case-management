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
  caseNumbersToAssociationId :Map;
  caseHistoryForMostRecentPSA :List;
  chargeHistoryForMostRecentPSA :Map;
  caseHistoryNotForMostRecentPSA :List;
  chargeHistoryNotForMostRecentPSA :Map;
  loading :boolean;
  modal :boolean;
  overview :boolean;
  personNeighbors :Map;
  psaNeighbors :Map;
  psaPermissions :boolean;
  addCaseToPSA :() => void;
  removeCaseFromPSA :() => void;
};

const CaseHistory = ({
  caseNumbersToAssociationId,
  caseHistoryForMostRecentPSA,
  chargeHistoryForMostRecentPSA,
  caseHistoryNotForMostRecentPSA,
  chargeHistoryNotForMostRecentPSA,
  loading,
  modal,
  overview,
  addCaseToPSA,
  personNeighbors,
  psaNeighbors,
  psaPermissions,
  removeCaseFromPSA
} :Props) => {

  return (
    <CaseHistoryWrapper modal={modal}>
      {
        overview && (
          <ChargeHistoryStats
              personNeighbors={personNeighbors}
              psaNeighbors={psaNeighbors} />
        )
      }
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
