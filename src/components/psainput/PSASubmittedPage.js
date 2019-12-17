/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import {
  Banner,
  Button,
  Card,
  CardSegment,
  CardStack
} from 'lattice-ui-kit';
import { List, Map } from 'immutable';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import type { RequestState } from 'redux-reqseq';

import CaseHistoryTimeline from '../casehistory/CaseHistoryTimeline';
import ChargeTable from '../charges/ChargeTable';
import DMFCell from '../dmf/DMFCell';
import DropdownButton from '../buttons/DropdownButton';
import HearingsForm from '../../containers/hearings/HearingsForm';
import LogoLoader from '../LogoLoader';
import PSARiskFactorsTable from './PSARiskFactorsTable';
import PSAScores from './PSAScores';
import SelectedHearingInfo from '../hearings/SelectedHearingInfo';

import * as Routes from '../../core/router/Routes';
import { OL } from '../../utils/consts/Colors';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { formatDMFFromEntity, getHeaderText } from '../../utils/DMFUtils';
import { JURISDICTION } from '../../utils/consts/Consts';
import { ResultHeader } from '../../utils/Layout';
import { CHARGES } from '../../utils/consts/FrontEndStateConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { HEARINGS_ACTIONS, HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';
import { clearSubmittedHearing } from '../../containers/hearings/HearingsActions';
import { goToPath } from '../../core/router/RoutingActionFactory';

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

const CreateHearingWrapper = styled.div`
  padding-top: 30px;
`;

const DMFWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const DMFLabel = styled.span`
  color: ${OL.GREY01};
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  margin: 15px 0;
`;

const NotesContainer = styled.div`
  color: ${OL.GREY15};
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
`;

const ButtonRow = styled.div`
  display: grid;
  grid-gap: 0 10px;
  grid-template-columns: repeat(3, 1fr);
`;

type Props = {
  actions :{
    clearSubmittedHearing :() => void;
    goToPath :(path :string) => void;
  };
  allCases :List;
  allCharges :Map;
  charges :List;
  context :string;
  dmf :Object;
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
  violentArrestCharges :Map;
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
          onClick={() => this.setState({ settingHearing: true })}>
        { buttonText }
      </Button>
    );
  };

  renderHearingNewHearingSection = () => {
    const {
      personEKID,
      psaEKID,
      context,
      submittedHearing,
      submittedHearingNeighbors,
      submitHearingReqState
    } = this.props;
    const submittingHearing = requestIsPending(submitHearingReqState);
    if (submittingHearing) return <LogoLoader />;

    const jurisdiction = JURISDICTION[context];
    if (!submittedHearing.size) {
      return (
        <CreateHearingWrapper>
          <HearingsForm
              jurisdiction={jurisdiction}
              personEKID={personEKID}
              psaEKID={psaEKID} />
        </CreateHearingWrapper>
      );
    }
    return (
      <SelectedHearingInfo
          hearing={submittedHearing}
          hearingNeighbors={submittedHearingNeighbors}
          setHearing={this.setHearing}
          onClose={() => this.setState({ settingHearing: false })} />
    );
  }

  renderContent = () => {
    const {
      allCases,
      allCharges,
      charges,
      dmf,
      notes,
      riskFactors,
      scores,
      selectedOrganizationId,
      selectedOrganizationSettings,
      violentArrestCharges
    } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], '');
    const formattedDMF = formatDMFFromEntity(dmf);
    return (
      <CardStack>
        <PSAScores scores={scores} />
        {
          includesPretrialModule && (
            <Card>
              <CardSegment padding="md" vertical>
                <ResultHeaderForCard>RCM Result</ResultHeaderForCard>
                <DMFWrapper>
                  <DMFCell dmf={formattedDMF} selected large />
                  <DMFLabel>{getHeaderText(formattedDMF)}</DMFLabel>
                </DMFWrapper>
              </CardSegment>
            </Card>
          )
        }
        <Card>
          <CardSegment noBleed={false} padding="30px 0" vertical>
            <ResultHeaderExtraPadding>Charges</ResultHeaderExtraPadding>
            <ChargeTable
                disabled
                charges={charges}
                violentChargeList={violentArrestCharges.get(selectedOrganizationId, Map())} />
          </CardSegment>
        </Card>
        <PSARiskFactorsTable riskFactors={riskFactors} />
        {
          notes && (
            <Card>
              <CardSegment padding="md" vertical>
                <ResultHeaderForCard>Notes</ResultHeaderForCard>
                <NotesContainer>{notes}</NotesContainer>
              </CardSegment>
            </Card>
          )
        }
        {
          includesPretrialModule
            ? (
              <Card>
                <CardSegment padding="md" vertical>
                  <ResultHeaderForCard>Timeline</ResultHeaderForCard>
                  <CaseHistoryTimeline caseHistory={allCases} chargeHistory={allCharges} />
                </CardSegment>
              </Card>
            ) : null
        }
      </CardStack>
    );
  }

  render() {
    const { selectedOrganizationSettings } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    const { settingHearing } = this.state;
    return (
      <>
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
                <ButtonRow>
                  { (includesPretrialModule && !settingHearing) && this.renderSetHearingButton() }
                  {this.renderExportButton()}
                  {this.renderProfileButton()}
                </ButtonRow>
              </Bookend>
            </CardSegment>
          </Card>
          <>
            {
              settingHearing
                ? this.renderHearingNewHearingSection()
                : this.renderContent()
            }
          </>
          <Card>
            <CardSegment padding="sm">
              <Bookend>
                <ButtonRow>
                  {this.renderExportButton(true)}
                  {this.renderProfileButton()}
                </ButtonRow>
                { (includesPretrialModule && !settingHearing) && this.renderSetHearingButton() }
              </Bookend>
            </CardSegment>
          </Card>
        </CardStack>
      </>
    );
  }
}

function mapStateToProps(state :Map) :Object {
  const app = state.get(STATE.APP);
  const charges = state.get(STATE.CHARGES);
  const hearings = state.get(STATE.HEARINGS);
  return {
    // App
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    // Charges
    [CHARGES.ARREST_VIOLENT]: charges.get(CHARGES.ARREST_VIOLENT),
    [CHARGES.COURT_VIOLENT]: charges.get(CHARGES.COURT_VIOLENT),

    // Hearings
    submitHearingReqState: getReqState(hearings, HEARINGS_ACTIONS.SUBMIT_HEARING),
    [HEARINGS_DATA.SUBMITTED_HEARING]: hearings.get(HEARINGS_DATA.SUBMITTED_HEARING),
    [HEARINGS_DATA.SUBMITTED_HEARING_NEIGHBORS]: hearings.get(HEARINGS_DATA.SUBMITTED_HEARING_NEIGHBORS)
  };
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    clearSubmittedHearing,
    goToPath,
  }, dispatch)
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PSASubmittedPage));
