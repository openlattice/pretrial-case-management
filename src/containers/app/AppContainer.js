/* @flow */

import React from 'react';

import isFunction from 'lodash/isFunction';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import { AuthActions, AuthUtils } from 'lattice-auth';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { EntityDataModelApiActions } from 'lattice-sagas';
import { Map } from 'immutable';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import {
  AppContainerWrapper,
  AppContentWrapper,
  AppHeaderWrapper,
  AppNavigationWrapper,
  LatticeLuxonUtils,
  lightTheme,
  MuiPickersUtilsProvider,
  Sizes,
  StylesProvider,
  ThemeProvider
} from 'lattice-ui-kit';
import {
  NavLink,
  Redirect,
  Route,
  Switch
} from 'react-router-dom';

import AppConsent from './AppConsent';
import ContactSupport from '../../components/app/ContactSupport';
import Dashboard from '../../components/dashboard/Dashboard';
import ErrorPage from '../../components/ErrorPage';
import Forms from '../forms/Forms';
import HearingSettingsModal from '../../components/hearings/HearingSettingsModal';
import logo from '../../assets/images/logo.jpg';
import LogoLoader from '../../components/LogoLoader';
import WelcomeBanner from '../../components/WelcomeBanner';
import { GOOGLE_TRACKING_ID } from '../../core/tracking/google/GoogleAnalytics';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { termsAreAccepted } from '../../utils/AcceptTermsUtils';
import { OL } from '../../utils/consts/Colors';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_ACTIONS, APP_DATA } from '../../utils/consts/redux/AppConsts';
import { CHARGE_DATA } from '../../utils/consts/redux/ChargeConsts';
import { COUNTIES_ACTIONS } from '../../utils/consts/redux/CountiesConsts';
import { HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';
import {
  getError,
  getReqState,
  requestIsFailure,
  requestIsPending
} from '../../utils/consts/redux/ReduxUtils';

import * as Routes from '../../core/router/Routes';
import { loadApp, switchOrganization } from './AppActionFactory';
import { loadArrestingAgencies, loadCharges, LOAD_CHARGES } from '../charges/ChargeActions';
import { getInCustodyData } from '../incustody/InCustodyActions';
import { loadCounties } from '../counties/CountiesActions';
import { loadJudges } from '../judges/JudgeActions';
import { getStaffEKIDs } from '../people/PeopleActions';
import { initializeSettings } from '../settings/SettingsActions';

declare var gtag :?Function;

const { logout } = AuthActions;
const { getAllPropertyTypes } = EntityDataModelApiActions;

const { APP_CONTENT_WIDTH } = Sizes; // 1020 = 960 for content + 2*30 for edges padding

/* styled components */

const PCMAppContainerWrapper = styled(AppContainerWrapper)`
  background: ${OL.GREY12};
  overflow: scroll;
`;

const PCMAppHeaderWrapper = styled(AppHeaderWrapper)`
  justify-content: center;

  > div {
    max-width: ${APP_CONTENT_WIDTH}px;
  }
`;

const PCMAppNavigationWrapper = styled(AppNavigationWrapper)`
  justify-content: center;

  > div {
    max-width: ${APP_CONTENT_WIDTH}px;
  }
`;

const AppBodyWrapper = styled.div`
  width: 100%;
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  margin: 0 auto;
`;

/* types */

type Props = {
  actions :{
    getAllPropertyTypes :RequestSequence;
    getInCustodyData :RequestSequence;
    getStaffEKIDs :RequestSequence;
    initializeSettings :RequestSequence;
    loadApp :RequestSequence;
    loadArrestingAgencies :RequestSequence;
    loadCounties :RequestSequence;
    loadCharges :RequestSequence;
    loadJudges :RequestSequence;
    switchOrganization :(org :Object) => Object;
    logout :() => void;
  };
  app :Map;
  appSettingsByOrgId :Map;
  selectedOrganizationSettings :Map;
  selectedOrganizationTitle :string;
  loadAppReqState :RequestState;
  settingsPermissions :boolean;
};

class AppContainer extends React.Component<Props, {}> {

  componentDidMount() {
    const { actions } = this.props;
    actions.loadApp();
    actions.getAllPropertyTypes();
  }

  componentDidUpdate(prevProps :Props) {
    const { app, actions } = this.props;
    const nextOrgId = app.get(APP_DATA.SELECTED_ORG_ID);
    const prevOrgId = prevProps.app.get(APP_DATA.SELECTED_ORG_ID);
    if (nextOrgId && prevOrgId !== nextOrgId) {
      this.initializeSettings();
      actions.loadCounties();
      actions.getInCustodyData();
      actions.loadJudges();
      actions.loadCharges();
      actions.getStaffEKIDs();
      actions.loadArrestingAgencies();
    }
  }

  initializeSettings = () => {
    const { actions, selectedOrganizationSettings } = this.props;
    if (selectedOrganizationSettings.size) actions.initializeSettings();
  }

  handleOnClickLogOut = () => {

    const { actions } = this.props;
    actions.logout();

    if (isFunction(gtag)) {
      gtag('config', GOOGLE_TRACKING_ID, { user_id: undefined, send_page_view: false });
    }
  }

  switchOrganization = (organization :Object) => {
    const { actions, app, appSettingsByOrgId } = this.props;
    const selectedOrganizationId = app.get(APP_DATA.SELECTED_ORG_ID);
    if (organization.value !== selectedOrganizationId) {
      actions.switchOrganization({
        settings: appSettingsByOrgId.get(organization.value, Map()),
        orgId: organization.value,
        title: organization.label
      });
    }
  }

  getDisplayName = () => {
    const userInfo = AuthUtils.getUserInfo();
    return (userInfo.email && userInfo.email.length > 0) ? userInfo.email : '';
  };

  getOrgSelector = () => {
    const {
      app,
      loadAppReqState
    } = this.props;

    const isLoading = requestIsPending(loadAppReqState);
    const selectedOrganizationId = app.get(APP_DATA.SELECTED_ORG_ID, '');
    const organizations = app.get(APP_DATA.ORGS);
    return {
      onChange: this.switchOrganization,
      organizations,
      selectedOrganizationId,
      isLoading
    };
  }

  renderAppContent = () => {
    const { loadAppReqState } = this.props;
    const loading = requestIsPending(loadAppReqState);
    const loadingError = requestIsFailure(loadAppReqState);
    if (loadingError) {
      return (
        <ErrorPage />
      );
    }
    return loading
      ? (
        <AppBodyWrapper>
          <LogoLoader loadingText="Loading..." />
        </AppBodyWrapper>
      )
      : (
        <AppBodyWrapper>
          <Switch>
            <Route path={Routes.TERMS} component={AppConsent} />
            { !termsAreAccepted() && <Redirect to={Routes.TERMS} /> }
            <Route path={Routes.DASHBOARD} component={Dashboard} />
            <Route path={Routes.FORMS} component={Forms} />
            <Redirect to={Routes.DASHBOARD} />
          </Switch>
        </AppBodyWrapper>
      );
  }

  render() {
    const {
      selectedOrganizationSettings,
      selectedOrganizationTitle,
      settingsPermissions
    } = this.props;
    const pretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    const module = pretrialModule ? 'Pretrial Case Management' : 'Public Safety Assessment';

    return (
      <ThemeProvider theme={lightTheme}>
        <MuiPickersUtilsProvider utils={LatticeLuxonUtils}>
          <StylesProvider injectFirst>
            <PCMAppContainerWrapper>
              <PCMAppHeaderWrapper
                  appIcon={logo}
                  appTitle={module}
                  logout={this.handleOnClickLogOut}
                  organizationsSelect={this.getOrgSelector()}
                  user={this.getDisplayName()}>
                <PCMAppNavigationWrapper>
                  <NavLink to={Routes.CREATE_FORMS} />
                </PCMAppNavigationWrapper>
              </PCMAppHeaderWrapper>
              <PCMAppNavigationWrapper>
                <NavLink to={Routes.CREATE_FORMS}>Home</NavLink>
                <NavLink to={Routes.PEOPLE}>Manage People</NavLink>
                <NavLink to={Routes.REVIEW_REPORTS}>Review Reports</NavLink>
                { pretrialModule && <NavLink to={Routes.DOWNLOAD_FORMS}>Downloads</NavLink> }
                { pretrialModule && <NavLink to={Routes.JUDGE_VIEW}>Judges</NavLink> }
                { settingsPermissions && <NavLink to={Routes.SETTINGS}>Settings</NavLink> }
              </PCMAppNavigationWrapper>
              <AppContentWrapper>
                { this.renderAppContent() }
              </AppContentWrapper>
              <ContactSupport />
              {
                selectedOrganizationTitle
                  && <WelcomeBanner tool={module} organization={selectedOrganizationTitle} />
              }
              <HearingSettingsModal />
            </PCMAppContainerWrapper>
          </StylesProvider>
        </MuiPickersUtilsProvider>
      </ThemeProvider>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const charges = state.get(STATE.CHARGES);
  const counties = state.get(STATE.COUNTIES);
  const hearings = state.get(STATE.HEARINGS);
  const settings = state.get(STATE.SETTINGS);
  const settingsPermissions = settings.getIn([SETTINGS_DATA.APP_SETTINGS, SETTINGS.SETTINGS_PERMISSIONS], false);
  return {
    app,
    loadAppReqState: getReqState(app, APP_ACTIONS.LOAD_APP),
    loadAppError: getError(app, APP_ACTIONS.LOAD_APP),
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SETTINGS_BY_ORG_ID]: app.get(APP_DATA.SETTINGS_BY_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),
    [APP_DATA.STAFF_IDS_TO_EKIDS]: app.get(APP_DATA.STAFF_IDS_TO_EKIDS),

    /* Charges */
    loadChargesReqState: getReqState(app, LOAD_CHARGES),
    [CHARGE_DATA.ARREST_CHARGES_BY_ID]: charges.get(CHARGE_DATA.ARREST_CHARGES_BY_ID),
    [CHARGE_DATA.COURT_CHARGES_BY_ID]: charges.get(CHARGE_DATA.COURT_CHARGES_BY_ID),

    loadCountiesReqState: getReqState(counties, COUNTIES_ACTIONS.LOAD_COUNTIES),

    [HEARINGS_DATA.SETTINGS_MODAL_OPEN]: hearings.get(HEARINGS_DATA.SETTINGS_MODAL_OPEN),

    /* Settings */
    settingsPermissions
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // App Actions
    loadApp,
    switchOrganization,
    // Charge Actions
    loadArrestingAgencies,
    loadCharges,
    // In-Custody Actions
    getInCustodyData,
    // Coutnies Actions
    loadCounties,
    // Judges Actions
    loadJudges,
    // People Actions
    getStaffEKIDs,
    // Auth Actions
    logout,
    // Edm Actions
    getAllPropertyTypes,
    // Settings Actions
    initializeSettings,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
