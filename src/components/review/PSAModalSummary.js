/*
 * @flow
 */
import React from 'react';
import Immutable, { Map } from 'immutable';
import styled from 'styled-components';
import { connect } from 'react-redux';

import ChargeHistoryStats from '../casehistory/ChargeHistoryStats';
import CaseHistoryList from '../casehistory/CaseHistoryList';
import ChargeTable from '../charges/ChargeTable';
import PSASummary from '../../containers/review/PSASummary';
import { AlternateSectionHeader, Count } from '../../utils/Layout';
import {
  APP_TYPES_FQNS,
  PROPERTY_TYPES,
  SETTINGS,
  MODULE
} from '../../utils/consts/DataModelConsts';
import {
  STATE,
  APP,
  CHARGES,
  PSA_NEIGHBOR
} from '../../utils/consts/FrontEndStateConsts';

let { MANUAL_PRETRIAL_CASES } = APP_TYPES_FQNS;

MANUAL_PRETRIAL_CASES = MANUAL_PRETRIAL_CASES.toString();

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
  addCaseToPSA :() => void,
  removeCaseFromPSA :() => void,
  caseNumbersToAssociationId :Immutable.List,
  chargeHistoryForMostRecentPSA :Immutable.Map,
  caseHistoryForMostRecentPSA :Immutable.List,
  notes :string,
  scores :Immutable.Map<*, *>,
  neighbors :Immutable.Map<*, *>,
  manualCaseHistory :Immutable.List<*>,
  chargeHistory :Immutable.List<*>,
  manualChargeHistory :Immutable.Map<*, *>,
  pendingCharges :Immutable.List<*>,
  selectedOrganizationId :string,
  selectedOrganizationSettings :Immutable.Map<*, *>,
  violentArrestCharges :Immutable.Map<*, *>,
  psaPermissions :boolean,
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
      neighbors,
      selectedOrganizationId,
      violentArrestCharges,
      addCaseToPSA,
      removeCaseFromPSA,
      caseNumbersToAssociationId,
      chargeHistoryForMostRecentPSA,
      caseHistoryForMostRecentPSA,
      psaPermissions
    } = this.props;
    const violentChargeList = violentArrestCharges.get(selectedOrganizationId, Map());
    const caseNum = neighbors.getIn(
      [MANUAL_PRETRIAL_CASES, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CASE_ID, 0], ''
    );
    const pretrialCase = manualCaseHistory
      .filter(caseObj => caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0], '') === caseNum);
    const charges = manualChargeHistory.get(caseNum, Immutable.List());

    const assocaitedCasesForForPSA = caseHistoryForMostRecentPSA.filter((caseObj) => {
      const caseNo = caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0]);
      return caseNumbersToAssociationId.get(caseNo);
    });
    return (
      <>
        <hr />
        <ChargeTableContainer>
          <AlternateSectionHeader>
            Arrest Charges
            <Count>{charges.size}</Count>
          </AlternateSectionHeader>
          <ChargeTable charges={charges} violentChargeList={violentChargeList} pretrialCase={pretrialCase} />
        </ChargeTableContainer>
        <hr />
        <ChargeTableContainer>
          <CaseHistoryList
              psaPermissions={psaPermissions}
              pendingCases
              addCaseToPSA={addCaseToPSA}
              removeCaseFromPSA={removeCaseFromPSA}
              caseNumbersToAssociationId={caseNumbersToAssociationId}
              title="Court Charges"
              caseHistory={assocaitedCasesForForPSA}
              chargeHistory={chargeHistoryForMostRecentPSA} />
        </ChargeTableContainer>
      </>
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
      scores,
      selectedOrganizationSettings
    } = this.props;

    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);

    return (
      <SummaryWrapper>
        <PSASummary
            notes={notes}
            scores={scores}
            neighbors={neighbors}
            manualCaseHistory={manualCaseHistory}
            downloadFn={downloadFn} />
        {
          includesPretrialModule
            ? (
              <ChargeHistoryStats
                  padding
                  pendingCharges={pendingCharges}
                  chargeHistory={chargeHistory} />

            ) : null
        }
        {this.renderCaseInfo()}
      </SummaryWrapper>
    );
  }
}

function mapStateToProps(state :Immutable.Map<*, *>) :Object {
  const app = state.get(STATE.APP);
  const charges = state.get(STATE.CHARGES);
  return {
    // App
    [APP.SELECTED_ORG_ID]: app.get(APP.SELECTED_ORG_ID),
    [APP.SELECTED_ORG_TITLE]: app.get(APP.SELECTED_ORG_TITLE),
    [APP.SELECTED_ORG_SETTINGS]: app.get(APP.SELECTED_ORG_SETTINGS),

    // Charges
    [CHARGES.ARREST_VIOLENT]: charges.get(CHARGES.ARREST_VIOLENT),
    [CHARGES.COURT_VIOLENT]: charges.get(CHARGES.COURT_VIOLENT)
  };
}

export default connect(mapStateToProps, null)(PSAModalSummary);
