/*
 * @flow
 */

import React from 'react';
import styled, { css } from 'styled-components';
import {
  Banner,
  Button,
  Card,
  CardSegment,
  CardStack,
  StyleUtils
} from 'lattice-ui-kit';
import { List, Map } from 'immutable';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import type { Dispatch } from 'redux';
import type { RequestState } from 'redux-reqseq';

import CaseHistoryTimeline from '../casehistory/CaseHistoryTimeline';
import ChargeTable from '../charges/ChargeTable';
import SummaryRCMDetails from '../rcm/SummaryRCMDetails';
import DropdownButton from '../buttons/DropdownButton';
import HearingsForm from '../../containers/hearings/HearingsForm';
import LogoLoader from '../LogoLoader';
import PSARiskFactorsTable from './PSARiskFactorsTable';
import PSAScores from './PSAScores';
import SelectedHearingInfo from '../hearings/SelectedHearingInfo';

import * as Routes from '../../core/router/Routes';
import { OL } from '../../utils/consts/Colors';
import { MODULE, SETTINGS, CASE_CONTEXTS } from '../../utils/consts/AppSettingConsts';
import { ResultHeader } from '../../utils/Layout';

import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { CHARGE_DATA } from '../../utils/consts/redux/ChargeConsts';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { HEARINGS_ACTIONS, HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';
import { clearSubmittedHearing } from '../../containers/hearings/HearingsActions';
import { goToPath } from '../../core/router/RoutingActionFactory';

const { getStyleVariation } = StyleUtils;

const ResultHeaderForCard = styled(ResultHeader)`
  margin-top: 0;
`;

const ResultHeaderExtraPadding = styled(ResultHeaderForCard)`
  padding-left: 30px;
`;

const Bookend = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const Header = styled.span`
  color: ${OL.GREY01};
  font-size: 18px;
`;

const CreateHearingWrapper = styled(Card)`
  width: 960px;
`;

const CreateHearingInnerWrapper = styled(Card)`
  width: 100%;
`;

const NotesContainer = styled.div`
  color: ${OL.GREY15};
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
`;

const two = css`
  grid-template-columns: repeat(2, 1fr);
`;
const three = css`
  grid-template-columns: repeat(3, 1fr);
`;
const numOfButtons = getStyleVariation('count', {
  two,
  three,
});

const ButtonRow = styled.div`
  display: grid;
  grid-gap: 0 10px;
  ${numOfButtons}
`;

type Props = {
  actions :{
    clearSubmittedHearing :() => void;
    goToPath :(path :string) => void;
  };
  allCases :List;
  allCharges :Map;
  charges :List;
  caseContext :string;
  getOnExport :(isCompact :boolean) => void;
  notes :string;
  personEKID :string;
  psaEKID :string;
  riskFactors :Object;
  scores :Map;
  selectedOrganizationId :string;
  selectedOrganizationSettings :Map;
  submitHearingReqState :RequestState;
  submittedHearing :Map;
  submittedHearingNeighbors :Map;
  submittedPSANeighbors :Map;
  violentArrestCharges :Map;
  violentCourtCharges :Map;
};

type State = {
  settingHearing :boolean;
};

class PSASubmittedPage extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      settingHearing: false
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.clearSubmittedHearing();
  }

  renderExportButton = (openAbove) => {
    const { getOnExport } = this.props;
    return (
      <DropdownButton
          title="PDF Report"
          openAbove={openAbove}
          options={[{
            label: 'Export compact version',
            onClick: () => getOnExport(true)
          }, {
            label: 'Export full version',
            onClick: () => getOnExport(false)
          }]} />
    );
  }

  renderProfileButton = () => {
    const { actions, personEKID } = this.props;
    return (
      <Button
          onClick={() => {
            actions.goToPath(Routes.PERSON_DETAILS.replace(':personEKID', personEKID));
          }}>
        Go to Profile
      </Button>
    );
  }

  setHearing = () => {
    const { actions } = this.props;
    this.setState({ settingHearing: true });
    actions.clearSubmittedHearing();
  };

  renderSetHearingButton = () => {
    const { submittedHearing } = this.props;
    const { settingHearing } = this.state;
    const buttonText = submittedHearing.size ? 'View Hearing' : 'Set Hearing';
    return (
      <Button
          disabled={settingHearing}
          mode="primary"
          onClick={this.setHearing}>
        { buttonText }
      </Button>
    );
  };

  renderHearingNewHearingSection = () => {
    const {
      personEKID,
      psaEKID,
      submittedHearing,
      submittedHearingNeighbors,
      submitHearingReqState
    } = this.props;
    const submittingHearing = requestIsPending(submitHearingReqState);
    if (submittingHearing) {
      return (
        <CardStack>
          <CreateHearingWrapper>
            <CreateHearingInnerWrapper padding="md">
              <LogoLoader
                  loadingText="Submitting hearing..."
                  noPadding={false}
                  size={30} />
            </CreateHearingInnerWrapper>
          </CreateHearingWrapper>
        </CardStack>
      );
    }

    if (submittedHearing.isEmpty()) {
      return (
        <CardStack>
          <CreateHearingWrapper>
            <CreateHearingInnerWrapper padding="md">
              <HearingsForm
                  personEKID={personEKID}
                  psaEKID={psaEKID} />
            </CreateHearingInnerWrapper>
          </CreateHearingWrapper>
        </CardStack>
      );
    }
    return (
      <CardStack>
        <CreateHearingWrapper>
          <CreateHearingInnerWrapper padding="md">
            <SelectedHearingInfo
                hearing={submittedHearing}
                hearingNeighbors={submittedHearingNeighbors}
                setHearing={this.setHearing}
                onClose={() => this.setState({ settingHearing: false })} />
          </CreateHearingInnerWrapper>
        </CreateHearingWrapper>
      </CardStack>
    );
  }

  renderContent = () => {
    const {
      allCases,
      allCharges,
      caseContext,
      charges,
      notes,
      riskFactors,
      scores,
      selectedOrganizationId,
      selectedOrganizationSettings,
      submittedPSANeighbors,
      violentArrestCharges,
      violentCourtCharges
    } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], '');
    const violentChargeList = caseContext === CASE_CONTEXTS.ARREST
      ? violentArrestCharges.get(selectedOrganizationId, Map())
      : violentCourtCharges.get(selectedOrganizationId, Map());
    return (
      <CardStack>
        <PSAScores scores={scores} />
        <Card>
          <CardSegment noBleed={false} padding="30px 0" vertical>
            <ResultHeaderExtraPadding>Charges</ResultHeaderExtraPadding>
            <ChargeTable
                disabled
                charges={charges}
                violentChargeList={violentChargeList} />
          </CardSegment>
          <PSARiskFactorsTable riskFactors={riskFactors} />
          {
            notes && (
              <CardSegment padding="md" vertical>
                <ResultHeaderForCard>Notes</ResultHeaderForCard>
                <NotesContainer>{notes}</NotesContainer>
              </CardSegment>
            )
          }
          {
            includesPretrialModule && (
              <CardSegment padding="md" vertical>
                <ResultHeaderForCard>Release Conditions Matrix</ResultHeaderForCard>
                <SummaryRCMDetails
                    neighbors={submittedPSANeighbors}
                    scores={scores}
                    isBookingContext={caseContext === CASE_CONTEXTS.ARREST} />
              </CardSegment>
            )
          }
          {
            includesPretrialModule
              ? (
                <CardSegment padding="md" vertical>
                  <ResultHeaderForCard>Timeline</ResultHeaderForCard>
                  <CaseHistoryTimeline caseHistory={allCases} chargeHistory={allCharges} />
                </CardSegment>
              ) : null
          }
        </Card>
      </CardStack>
    );
  }

  render() {
    const { selectedOrganizationSettings } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    const { settingHearing } = this.state;
    return (
      <CardStack>
        <Banner
            isOpen
            maxHeight="120px"
            mode="success">
          PSA Successfully Submitted!
        </Banner>
        <Card>
          <CardSegment padding="sm" vertical>
            <Bookend>
              <Header>Public Safety Assessment</Header>
              <ButtonRow count={(includesPretrialModule && !settingHearing) ? 'three' : 'two'}>
                { (includesPretrialModule && !settingHearing) && this.renderSetHearingButton() }
                {this.renderExportButton()}
                {this.renderProfileButton()}
              </ButtonRow>
            </Bookend>
          </CardSegment>
        </Card>
        {
          settingHearing
            ? this.renderHearingNewHearingSection()
            : this.renderContent()
        }
        <Card>
          <CardSegment padding="sm">
            <Bookend>
              <ButtonRow count="two">
                {this.renderExportButton(true)}
                {this.renderProfileButton()}
              </ButtonRow>
              { (includesPretrialModule && !settingHearing) && this.renderSetHearingButton() }
            </Bookend>
          </CardSegment>
        </Card>
      </CardStack>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const app = state.get(STATE.APP);
  const charges = state.get(STATE.CHARGES);
  const hearings = state.get(STATE.HEARINGS);
  return {
    // App
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    // Charges
    [CHARGE_DATA.ARREST_VIOLENT]: charges.get(CHARGE_DATA.ARREST_VIOLENT),
    [CHARGE_DATA.COURT_VIOLENT]: charges.get(CHARGE_DATA.COURT_VIOLENT),

    // Hearings
    submitHearingReqState: getReqState(hearings, HEARINGS_ACTIONS.SUBMIT_HEARING),
    [HEARINGS_DATA.SUBMITTED_HEARING]: hearings.get(HEARINGS_DATA.SUBMITTED_HEARING),
    [HEARINGS_DATA.SUBMITTED_HEARING_NEIGHBORS]: hearings.get(HEARINGS_DATA.SUBMITTED_HEARING_NEIGHBORS)
  };
};

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Hearing Actions
    clearSubmittedHearing,
    // Routing Actions
    goToPath,
  }, dispatch)
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PSASubmittedPage));
