/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import { AuthUtils } from 'lattice-auth';
import { Map } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import {
  Button,
  Card,
  CardSegment,
  EditButton
} from 'lattice-ui-kit';

import NavButtonToolbar from '../../components/buttons/NavButtonToolbar';
import RCMSettings from '../rcm/RCMSettings';
import GeneralSettingsContainer from './GeneralSettingsContainer';
import ManageChargesContainer from '../charges/ChargesContainer';
import { HeaderSection } from '../../components/settings/SettingsStyledComponents';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { getRCMSettings, getRCMConditions, getActiveRCMLevels } from '../../utils/RCMUtils';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { getReqState, requestIsSuccess } from '../../utils/consts/redux/ReduxUtils';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { COUNTIES_DATA } from '../../utils/consts/redux/CountiesConsts';
import { SETTINGS_ACTIONS, SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';
import { StyledFormViewWrapper, StyledFormWrapper } from '../../utils/Layout';

import { initializeSettings, updateSetting, submitSettings } from './SettingsActions';
import * as Routes from '../../core/router/Routes';

const SubmitRow = styled.div`
  width: 100%;
  padding: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

type Props = {
  actions :{
    initializeSettings :RequestSequence;
    updateSetting :RequestSequence;
    submitSettings :RequestSequence;
  };
  settings :Map;
  selectedOrganizationId :string;
  selectedOrganizationSettings :Map;
  submitSettingsReqState :RequestState;
};

class SettingsContainer extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = { editing: false };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { submitSettingsReqState } = nextProps;
    const { editing } = prevState;
    if (editing && requestIsSuccess(submitSettingsReqState)) {
      return { editing: false };
    }
    return null;
  }

  initializeSettings = () => {
    const { actions, selectedOrganizationSettings } = this.props;
    actions.initializeSettings({ selectedOrganizationSettings });
  }

  componentDidMount() {
    const { selectedOrganizationId } = this.props;
    if (selectedOrganizationId) {
      this.initializeSettings();
    }
  }

  componentDidUpdate(prevProps) {
    const { selectedOrganizationId, submitSettingsReqState } = this.props;
    if (selectedOrganizationId !== prevProps.selectedOrganizationId || requestIsSuccess(submitSettingsReqState)) {
      this.initializeSettings();
    }
  }

  submit = () => {
    const { actions } = this.props;
    actions.submitSettings();
  }

  cancelEdit = () => {
    this.initializeSettings();
    this.setState({ editing: false });
  };

  isReadyToSubmit = () => {
    const { settings } = this.props;
    const rcmSettings = getRCMSettings(settings);
    const levels = getActiveRCMLevels(rcmSettings);
    const conditions = getRCMConditions(rcmSettings);
    return levels
      .keySeq().every((level) => conditions.valueSeq().some((condition) => condition.get(level, false)));
  }

  getNavTabs = () => (
    [
      {
        label: 'General',
        path: Routes.GENERAL_SETTINGS
      },
      {
        label: 'Release Condition Matrix',
        path: Routes.RCM_SETTINGS
      },
      {
        label: 'Charges',
        path: Routes.CHARGE_SETTINGS
      }
    ]
  )

  renderRCMSettings = () => {
    const { editing } = this.state;
    return <RCMSettings editing={editing} />;
  }

  renderGeneralSettings = () => {
    const { editing } = this.state;
    return <GeneralSettingsContainer editing={editing} />;
  }

  renderHeader = () => {
    const { editing } = this.state;
    const { settings } = this.props;
    const includesPretrialModule = settings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    const userIsAdmin = AuthUtils.isAdmin();
    const editButton = editing
      ? <EditButton onClick={this.cancelEdit}>Cancel</EditButton>
      : <EditButton onClick={this.startEdit}>Edit</EditButton>;
    return (
      <>
        <CardSegment>
          <HeaderSection>Manage App Settings</HeaderSection>
          <HeaderSection>
            {
              userIsAdmin
                ? (
                  <div>
                    { editButton }
                  </div>
                ) : null
            }
          </HeaderSection>
        </CardSegment>
        {
          includesPretrialModule
            ? (
              <CardSegment>
                <NavButtonToolbar options={this.getNavTabs()} />
              </CardSegment>
            )
            : null
        }
      </>
    );
  }

  render() {
    const { actions } = this.props;
    const { editing } = this.state;
    const arrestRoute = `${Routes.CHARGE_SETTINGS}${Routes.ARREST_CHARGES}`;
    const courtRoute = `${Routes.CHARGE_SETTINGS}${Routes.COURT_CHARGES}`;
    return (
      <StyledFormViewWrapper>
        <StyledFormWrapper>
          <Card>
            { this.renderHeader() }
            <CardSegment vertical>
              <Switch>
                <Route exact path={Routes.GENERAL_SETTINGS} component={() => this.renderGeneralSettings()} />
                <Route exact path={arrestRoute} component={ManageChargesContainer} />
                <Route exact path={courtRoute} component={ManageChargesContainer} />
                <Route exact path={Routes.CHARGE_SETTINGS} component={ManageChargesContainer} />
                <Route exact path={Routes.RCM_SETTINGS} component={() => this.renderRCMSettings()} />
                <Redirect to={Routes.GENERAL_SETTINGS} />
              </Switch>
            </CardSegment>
            {
              editing
                ? (
                  <SubmitRow>
                    <Button mode="primary" disabled={!this.isReadyToSubmit()} onClick={actions.submitSettings}>
                      Submit
                    </Button>
                  </SubmitRow>
                ) : null
            }
          </Card>
        </StyledFormWrapper>
      </StyledFormViewWrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const counties = state.get(STATE.COUNTIES);
  const settings = state.get(STATE.SETTINGS);
  return {

    // Counties
    [COUNTIES_DATA.COUNTIES_BY_ID]: counties.get(COUNTIES_DATA.COUNTIES_BY_ID),

    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    submitSettingsReqState: getReqState(settings, SETTINGS_ACTIONS.SUBMIT_SETTINGS),
    settings: settings.get(SETTINGS_DATA.APP_SETTINGS)
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Submit Actions
    initializeSettings,
    updateSetting,
    submitSettings
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsContainer);
