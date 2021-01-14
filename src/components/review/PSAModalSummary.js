import React from 'react';
import { List, Map } from 'immutable';
import styled from 'styled-components';
import { connect } from 'react-redux';

import ArrestCard from '../arrest/ArrestCard';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import CaseHistoryList from '../casehistory/CaseHistoryList';
import ChargeHistoryStats from '../casehistory/ChargeHistoryStats';
import ChargeTable from '../charges/ChargeTable';
import { CASE_CONTEXTS, MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { OL } from '../../utils/consts/Colors';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getNeighborDetailsForEntitySet } from '../../utils/DataUtils';
import {
  AlternateSectionHeader,
  Count,
  SummaryRowWrapper,
  Title
} from '../../utils/Layout';

import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';
import { CHARGE_DATA } from '../../utils/consts/redux/ChargeConsts';

const { MANUAL_PRETRIAL_CASES } = APP_TYPES;

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

const NotesTitle = styled(Title)`
  margin-top: 0;
`;

const NotesWrapper = styled.div`
  width: 100%;
  padding: ${(props :Object) => (props.isProfile ? '0 30px 0' : '30px')};
  border-right: ${(props :Object) => (props.isProfile ? `solid 1px ${OL.GREY28}` : 'none')};
`;

type Props = {
  addCaseToPSA :() => void;
  caseContext :string;
  caseNumbersToAssociationId :List;
  chargeHistoryForMostRecentPSA :Map;
  caseHistoryForMostRecentPSA :List;
  manualCaseHistory :List;
  manualChargeHistory :Map;
  neighbors :Map;
  notes :string;
  personNeighbors :Map;
  psaPermissions :boolean;
  selectedOrganizationId :string;
  settings :Map;
  removeCaseFromPSA :() => void;
  violentArrestCharges :Map;
  violentCourtCharges :Map;
};

class PSAModalSummary extends React.Component<Props, *> {

  renderCaseInfo = () => {
    const {
      addCaseToPSA,
      caseHistoryForMostRecentPSA,
      caseNumbersToAssociationId,
      chargeHistoryForMostRecentPSA,
      caseContext,
      manualCaseHistory,
      manualChargeHistory,
      neighbors,
      psaPermissions,
      removeCaseFromPSA,
      selectedOrganizationId,
      settings,
      violentArrestCharges,
      violentCourtCharges
    } = this.props;
    const includesPretrialModule = settings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    const violentArrestChargeList = violentArrestCharges.get(selectedOrganizationId, Map());
    const violentCourtChargesList = violentCourtCharges.get(selectedOrganizationId, Map());
    const violentChargeList = (caseContext === CASE_CONTEXTS.ARREST)
      ? violentArrestChargeList : violentCourtChargesList;
    const caseContextHeader = caseContext.slice(0, 1).toUpperCase() + caseContext.slice(1);
    const caseNum = neighbors.getIn(
      [MANUAL_PRETRIAL_CASES, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CASE_ID, 0], ''
    );
    const pretrialCase = manualCaseHistory
      .filter((caseObj) => caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0], '') === caseNum);
    const charges = manualChargeHistory.get(caseNum, List());

    const associatedCasesForForPSA = caseHistoryForMostRecentPSA.filter((caseObj) => {
      const caseNo = caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0]);
      return caseNumbersToAssociationId.get(caseNo);
    });

    return (
      <>
        <hr />
        <ChargeTableContainer>
          <AlternateSectionHeader>
            {`${caseContextHeader} Charges`}
            <Count>{charges.size}</Count>
          </AlternateSectionHeader>
          <ChargeTable charges={charges} violentChargeList={violentChargeList} pretrialCase={pretrialCase} />
        </ChargeTableContainer>
        {
          includesPretrialModule
            ? (
              <>
                <hr />
                <ChargeTableContainer>
                  <CaseHistoryList
                      psaPermissions={psaPermissions}
                      pendingCases
                      addCaseToPSA={addCaseToPSA}
                      removeCaseFromPSA={removeCaseFromPSA}
                      caseNumbersToAssociationId={caseNumbersToAssociationId}
                      title="Court Charges"
                      caseHistory={associatedCasesForForPSA}
                      chargeHistory={chargeHistoryForMostRecentPSA} />
                </ChargeTableContainer>
              </>
            ) : null
        }
      </>
    );
  }

  render() {
    const {
      neighbors,
      notes,
      personNeighbors,
      settings
    } = this.props;
    const pretrialCase = getNeighborDetailsForEntitySet(neighbors, MANUAL_PRETRIAL_CASES);

    const includesPretrialModule = settings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);

    return (
      <SummaryWrapper>
        <SummaryRowWrapper>
          <NotesWrapper>
            <NotesTitle withSubtitle><span>Notes</span></NotesTitle>
            {notes || 'No Notes'}
          </NotesWrapper>
          <ArrestCard arrest={pretrialCase} component={CONTENT_CONSTS.ARREST} />
        </SummaryRowWrapper>
        <hr />
        {
          includesPretrialModule
            ? (
              <ChargeHistoryStats
                  padding
                  personNeighbors={personNeighbors}
                  psaNeighbors={neighbors} />

            ) : null
        }
        {this.renderCaseInfo()}
      </SummaryWrapper>
    );
  }
}

function mapStateToProps(state :Map) :Object {
  const app = state.get(STATE.APP);
  const charges = state.get(STATE.CHARGES);
  const settings = state.getIn([STATE.SETTINGS, SETTINGS_DATA.APP_SETTINGS]);
  return {
    // App
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),

    // Charges
    [CHARGE_DATA.ARREST_VIOLENT]: charges.get(CHARGE_DATA.ARREST_VIOLENT),
    [CHARGE_DATA.COURT_VIOLENT]: charges.get(CHARGE_DATA.COURT_VIOLENT),
    settings
  };
}

// $FlowFixMe
export default connect(mapStateToProps, null)(PSAModalSummary);
