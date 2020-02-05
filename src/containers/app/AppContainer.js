/*
 * @flow
 */

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
  Sizes
} from 'lattice-ui-kit';
import {
  NavLink,
  Redirect,
  Route,
  Switch
} from 'react-router-dom';

import logo from '../../assets/images/logo.jpg';
import AppConsent from './AppConsent';
import ErrorPage from '../../components/ErrorPage';
import Dashboard from '../../components/dashboard/Dashboard';
import HearingSettingsModal from '../../components/hearings/HearingSettingsModal';
import Forms from '../forms/Forms';
import ContactSupport from '../../components/app/ContactSupport';
import LogoLoader from '../../components/LogoLoader';
import WelcomeBanner from '../../components/WelcomeBanner';
import { GOOGLE_TRACKING_ID } from '../../core/tracking/google/GoogleAnalytics';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { APP_TYPES } from '../../utils/consts/DataModelConsts';
import { termsAreAccepted } from '../../utils/AcceptTermsUtils';
import { OL } from '../../utils/consts/Colors';

import { CHARGES } from '../../utils/consts/FrontEndStateConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_ACTIONS, APP_DATA } from '../../utils/consts/redux/AppConsts';
import { COUNTIES_ACTIONS } from '../../utils/consts/redux/CountiesConsts';
import { HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';
import {
  getError,
  getReqState,
  requestIsFailure,
  requestIsPending
} from '../../utils/consts/redux/ReduxUtils';

import * as Routes from '../../core/router/Routes';
import { loadApp, switchOrganization } from './AppActionFactory';
import { loadArrestingAgencies, loadCharges } from '../charges/ChargesActionFactory';
import { getInCustodyData } from '../incustody/InCustodyActions';
import { loadCounties } from '../counties/CountiesActions';
import { loadJudges } from '../hearings/HearingsActions';
import { getStaffEKIDs } from '../people/PeopleActions';

declare var gtag :?Function;

const { logout } = AuthActions;
const { getAllPropertyTypes } = EntityDataModelApiActions;

const {
  ARREST_CHARGE_LIST,
  COURT_CHARGE_LIST
} = APP_TYPES;

const { APP_CONTENT_WIDTH } = Sizes; // 1020 = 960 for content + 2*30 for edges padding

/*
 * styled components
 */

const PCMAppHeaderWrapper = styled(AppHeaderWrapper)`
   > div {
     max-width: ${APP_CONTENT_WIDTH}px;
   }
`;

const PCMAppNavigationWrapper = styled(AppNavigationWrapper)`
  > div {
   max-width: ${APP_CONTENT_WIDTH}px;
  }
`;

const PCMAppContainerWrapper = styled(AppContainerWrapper)`
  background: ${OL.GREY12};
  overflow: scroll;
`;

const AppBodyWrapper = styled.div`
  width: 100%;
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  margin: 0 auto;
`;

/*
 * types
 */

type Props = {
  actions :{
    getAllPropertyTypes :RequestSequence;
    getInCustodyData :RequestSequence;
    getStaffEKIDs :RequestSequence;
    loadApp :RequestSequence;
    loadArrestingAgencies :RequestSequence;
    loadCounties :RequestSequence;
    loadCharges :RequestSequence;
    loadJudges :RequestSequence;
    switchOrganization :(org :Object) => Object;
    logout :() => void;
  };
  app :Map,
  appSettingsByOrgId :Map,
  selectedOrganizationSettings :Map,
  selectedOrganizationTitle :string,
  loadAppReqState :RequestState
};

class AppContainer extends React.Component<Props, {}> {

  componentDidMount() {
    const { actions } = this.props;
    actions.loadApp();
    actions.getAllPropertyTypes();
  }

  componentDidUpdate(prevProps :Props) {
    const { app, actions } = this.props;
    const nextOrg = app.get(APP_DATA.ORGS);
    const nextOrgId = app.get(APP_DATA.SELECTED_ORG_ID);
    const prevOrgId = prevProps.app.get(APP_DATA.SELECTED_ORG_ID);
    if (nextOrgId && prevOrgId !== nextOrgId) {
      actions.loadCounties();
      actions.getInCustodyData();
      actions.loadJudges();
      nextOrg.keySeq().forEach((id) => {
        const selectedOrgId :string = id;
        const arrestChargesEntitySetId = getEntitySetIdFromApp(app, ARREST_CHARGE_LIST);
        const courtChargesEntitySetId = getEntitySetIdFromApp(app, COURT_CHARGE_LIST);
        actions.loadCharges({
          arrestChargesEntitySetId,
          courtChargesEntitySetId,
          selectedOrgId
        });
        actions.getStaffEKIDs();
        actions.loadArrestingAgencies();
      });
    }
  }

  handleOnClickLogOut = () => {

    const { actions } = this.props;
    actions.logout();

    if (isFunction(gtag)) {
      gtag('config', GOOGLE_TRACKING_ID, { user_id: undefined, send_page_view: false });
    }
  }

  switchOrganization = (organization) => {
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
      selectedOrganizationTitle
    } = this.props;
    const pretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    const module = pretrialModule ? 'Pretrial Case Management' : 'PSA Calculator';

    const userIsAdmin = AuthUtils.isAdmin();
    return (
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
          <NavLink to={Routes.PEOPLE}>Manage People</NavLink>
          <NavLink to={Routes.CREATE_FORMS}>Create Report</NavLink>
          <NavLink to={Routes.REVIEW_FORMS}>Review Reports</NavLink>
          <NavLink to={Routes.DOWNLOAD_FORMS}>Downloads</NavLink>
          { pretrialModule && <NavLink to={Routes.JUDGE_VIEW}>Judges</NavLink> }
          { userIsAdmin && <NavLink to={Routes.SETTINGS}>Settings</NavLink> }
        </PCMAppNavigationWrapper>
        <AppContentWrapper contentWidth={APP_CONTENT_WIDTH}>
          { this.renderAppContent() }
        </AppContentWrapper>
        <ContactSupport />
        { selectedOrganizationTitle ? <WelcomeBanner tool={module} organization={selectedOrganizationTitle} /> : null }
        <HearingSettingsModal />
      </PCMAppContainerWrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const charges = state.get(STATE.CHARGES);
  const counties = state.get(STATE.COUNTIES);
  const hearings = state.get(STATE.HEARINGS);
  return {
    app,
    loadAppReqState: getReqState(app, APP_ACTIONS.LOAD_APP),
    loadAppError: getError(app, APP_ACTIONS.LOAD_APP),
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.APP_DATA_SETTINGS_ID),
    [APP_DATA.SETTINGS_BY_ORG_ID]: app.get(APP_DATA.SETTINGS_BY_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),
    [APP_DATA.STAFF_IDS_TO_EKIDS]: app.get(APP_DATA.STAFF_IDS_TO_EKIDS),

    [CHARGES.ARREST]: charges.get(CHARGES.ARREST),
    [CHARGES.COURT]: charges.get(CHARGES.COURT),
    [CHARGES.LOADING]: charges.get(CHARGES.LOADING),

    loadCountiesReqState: getReqState(counties, COUNTIES_ACTIONS.LOAD_COUNTIES),

    [HEARINGS_DATA.SETTINGS_MODAL_OPEN]: hearings.get(HEARINGS_DATA.SETTINGS_MODAL_OPEN)
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
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
