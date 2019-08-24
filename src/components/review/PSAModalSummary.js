/*
 * @flow
 */
import React from 'react';
import { DateTime } from 'luxon';
import Immutable, { Map } from 'immutable';
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

const SectionoWrapper = styled.div`
  width: 100%;
`;

const RCMWrapper = styled(SectionoWrapper)`
  padding-left: 30px;

`;
const ArrestAndNotes = styled(SectionoWrapper)`
  border-right: 1px solid ${OL.GREY11};
`;

const StyledRow = styled(SummaryRowWrapper)`
  grid-template-columns: 60% 40%;
  padding: 0 30px 30px;
  margin: 30px 0 0;
  border-bottom: 1px solid ${OL.GREY11};
`;

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

const ArrestWrapper = styled.div`
  width: 100%;
  display: grid;
  padding-bottom: 15px;
  margin-bottom: 15px;
  border-bottom: 1px solid ${OL.GREY11};
  grid-template-columns: repeat(3, 1fr);
`;

type Props = {
  addCaseToPSA :() => void,
  removeCaseFromPSA :() => void,
  chargeType :string,
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
  psaPermissions :boolean
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
      .filter(caseObj => caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0], '') === caseNum);
    const charges = manualChargeHistory.get(caseNum, Immutable.List());

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

    const content = generalContent.map(item => (
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

function mapStateToProps(state :Immutable.Map<*, *>) :Object {
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
