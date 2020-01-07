/*
 * @flow
 */
import React from 'react';
import { DateTime } from 'luxon';
import { Map, List } from 'immutable';
import styled from 'styled-components';
import { connect } from 'react-redux';

import SummaryDMFDetails from '../dmf/SummaryDMFDetails';
import { getEntityProperties, getNeighborDetailsForEntitySet } from '../../utils/DataUtils';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { OL } from '../../utils/consts/Colors';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import ChargeHistoryStats from '../casehistory/ChargeHistoryStats';
import CaseHistoryList from '../casehistory/CaseHistoryList';
import ChargeTable from '../charges/ChargeTable';
import { DATE_FORMAT, TIME_FORMAT } from '../../utils/consts/DateTimeConsts';
import {
  AlternateSectionHeader,
  Count,
  Content,
  ContentBlock,
  ContentHeader,
  ContentLabel,
  SummaryRowWrapper
} from '../../utils/Layout';

import { CHARGES, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

const { MANUAL_PRETRIAL_CASES } = APP_TYPES;

const { ARREST_DATE_TIME, ARRESTING_AGENCY } = PROPERTY_TYPES;


const ArrestAndNotes = styled.div`
  border-right: 1px solid ${OL.GREY11};
  width: 100%;
`;

const ArrestWrapper = styled.div`
  border-bottom: 1px solid ${OL.GREY11};
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 15px;
  padding-bottom: 15px;
  width: 100%;
`;

const ChargeTableContainer = styled.div`
  margin: 0;
  text-align: center;
  width: 100%;
`;


const RCMWrapper = styled.div`
  width: 100%;
  padding-left: 30px;
`;

const StyledRow = styled(SummaryRowWrapper)`
  border-bottom: 1px solid ${OL.GREY11};
  grid-template-columns: 60% 40%;
  padding: 0 30px 30px;
  margin: 30px 0 0;
`;

const SummaryWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;


type Props = {
  addCaseToPSA :() => void;
  chargeHistory :List;
  chargeHistoryForMostRecentPSA :Map;
  chargeType :string;
  caseHistoryForMostRecentPSA :List;
  caseNumbersToAssociationId :List;
  manualCaseHistory :List;
  manualChargeHistory :Map;
  neighbors :Map;
  notes :string;
  pendingCharges :List;
  psaPermissions :boolean;
  removeCaseFromPSA :() => void;
  scores :Map;
  selectedOrganizationId :string;
  selectedOrganizationSettings :Map;
  violentArrestCharges :Map;
};

class PSAModalSummary extends React.Component<Props, *> {

  renderCaseInfo = () => {
    const {
      chargeType,
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
      psaPermissions,
      selectedOrganizationSettings
    } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    const violentChargeList = violentArrestCharges.get(selectedOrganizationId, Map());
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
            {`${chargeType} Charges`}
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

  renderArrestaInfoAndPSANotes = () => {
    const { neighbors } = this.props;
    const pretrialCase = getNeighborDetailsForEntitySet(neighbors, MANUAL_PRETRIAL_CASES);
    const {
      [ARREST_DATE_TIME]: arrestDateTime,
      [ARRESTING_AGENCY]: arrestingAgency
    } = getEntityProperties(
      pretrialCase,
      [ARREST_DATE_TIME, ARRESTING_AGENCY]
    );
    const arrestDate = DateTime.fromISO(arrestDateTime).toFormat(DATE_FORMAT);
    const arrestTime = DateTime.fromISO(arrestDateTime).toFormat(TIME_FORMAT);

    const generalContent = [
      {
        label: 'Arrest Date',
        content: [arrestDate]
      },
      {
        label: 'Arrest Time',
        content: [arrestTime]
      },
      {
        label: 'Arresting Agency',
        content: [arrestingAgency]
      }
    ];

    const content = generalContent.map((item) => (
      <ContentBlock key={item.label}>
        <ContentLabel>{ item.label }</ContentLabel>
        <Content>{ item.content }</Content>
      </ContentBlock>
    ));
    return (
      <ArrestAndNotes>
        <ContentHeader>Arrest</ContentHeader>
        <ArrestWrapper>
          {content}
        </ArrestWrapper>
        {this.renderNotes()}
      </ArrestAndNotes>
    );
  };

  renderNotes = () => {
    const { notes } = this.props;
    return (
      <>
        <ContentHeader>Notes</ContentHeader>
        {notes || 'No Notes'}
      </>
    );
  }

  renderRCM = () => {
    const { neighbors, scores } = this.props;
    return (
      <RCMWrapper>
        <ContentHeader>RCM</ContentHeader>
        <SummaryDMFDetails neighbors={neighbors} scores={scores} />
      </RCMWrapper>
    );
  }

  render() {
    const {
      chargeHistory,
      pendingCharges,
      selectedOrganizationSettings
    } = this.props;

    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);

    return (
      <SummaryWrapper>
        <StyledRow>
          {this.renderArrestaInfoAndPSANotes()}
          {this.renderRCM()}
        </StyledRow>
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

function mapStateToProps(state :Map<*, *>) :Object {
  const app = state.get(STATE.APP);
  const charges = state.get(STATE.CHARGES);
  return {
    // App
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    // Charges
    [CHARGES.ARREST_VIOLENT]: charges.get(CHARGES.ARREST_VIOLENT),
    [CHARGES.COURT_VIOLENT]: charges.get(CHARGES.COURT_VIOLENT)
  };
}

export default connect(mapStateToProps, null)(PSAModalSummary);
