/*
 * @flow
 */
import React from 'react';
import { List, Map } from 'immutable';
import type { UUID } from 'lattice';

import ChargeHistoryStats from './ChargeHistoryStats';
import CaseHistoryList from './CaseHistoryList';

type Props = {
  addCaseToPSA :(caseId :UUID) => void;
  caseHistoryForMostRecentPSA :List;
  caseHistoryNotForMostRecentPSA :List;
  caseNumbersToAssociationId :Map;
  chargeHistoryForMostRecentPSA :Map;
  chargeHistoryNotForMostRecentPSA :Map;
  modal :boolean;
  personNeighbors :Map;
  psaNeighbors :Map;
  psaPermissions :boolean;
  removeCaseFromPSA :(associationEKID :UUID) => void;
};

const CaseHistory = ({
  addCaseToPSA,
  caseHistoryForMostRecentPSA,
  caseHistoryNotForMostRecentPSA,
  caseNumbersToAssociationId,
  chargeHistoryForMostRecentPSA,
  chargeHistoryNotForMostRecentPSA,
  modal,
  personNeighbors,
  psaNeighbors,
  psaPermissions,
  removeCaseFromPSA
} :Props) => (
  <div>
    <ChargeHistoryStats
        padding
        personNeighbors={personNeighbors}
        psaNeighbors={psaNeighbors} />
    <CaseHistoryList
        addCaseToPSA={addCaseToPSA}
        caseHistory={caseHistoryForMostRecentPSA}
        caseNumbersToAssociationId={caseNumbersToAssociationId}
        chargeHistory={chargeHistoryForMostRecentPSA}
        modal={modal}
        pendingCases
        psaPermissions={psaPermissions}
        removeCaseFromPSA={removeCaseFromPSA}
        title="Pending Cases on Arrest Date for Current PSA" />
    <CaseHistoryList
        caseHistory={caseHistoryNotForMostRecentPSA}
        chargeHistory={chargeHistoryNotForMostRecentPSA}
        modal={modal}
        title="Case History" />
  </div>
);

export default CaseHistory;
