/*
 * @flow
 */

import React from 'react';

import isFunction from 'lodash/isFunction';
import styled from 'styled-components';
import { AuthActions, AuthUtils } from 'lattice-auth';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { EntityDataModelApiActions } from 'lattice-sagas';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Map } from 'immutable';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import AppConsent from './AppConsent';
import ErrorPage from '../../components/ErrorPage';
import HeaderNav from '../../components/nav/HeaderNav';
import Dashboard from '../../components/dashboard/Dashboard';
import SettingsContainer from '../settings/SettingsContainer';
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
import { HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';
import {
  getError,
  getReqState,
  requestIsFailure,
  requestIsPending
} from '../../utils/consts/redux/ReduxUtils';

import * as Routes from '../../core/router/Routes';
import * as AppActionFactory from './AppActionFactory';
import * as ChargesActionFactory from '../charges/ChargesActionFactory';
import { loadJudges } from '../hearings/HearingsActions';
import { getStaffEKIDs } from '../people/PeopleActionFactory';

declare var gtag :?Function;

const { logout } = AuthActions;
const { getAllPropertyTypes } = EntityDataModelApiActions;

const {
  ARREST_CHARGE_LIST,
  COURT_CHARGE_LIST
} = APP_TYPES;

/*
 * styled components
 */

const AppWrapper = styled.div`
  background-color: ${OL.GREY09};
  display: flex;
  flex-direction: column;
  min-height: 100%;
  min-width: fit-content;
  font-family: 'Open Sans', sans-serif;
`;

const AppBodyWrapper = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  padding: 30px 170px;
  margin: 0 auto;
`;

/*
 * types
 */

type Props = {
  app :Map<*, *>,
  appSettingsByOrgId :Map<*, *>,
  selectedOrganizationSettings :Map<*, *>,
  selectedOrganizationTitle :string,
  loadAppReqState :RequestState,
  loadAppError :Map<*, *>,
  actions :{
    getAllPropertyTypes :RequestSequence;
    loadApp :RequestSequence;
    loadCharges :RequestSequence;
    switchOrganization :(org :Object) => Object;
    logout :() => void;
  };
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

  renderComponent = (Component, props) => (
    termsAreAccepted()
      ? <Component {...props} />
      : <Redirect to={Routes.TERMS} />
  );

  renderIfAdmin = (Component, props) => {
    if (!AuthUtils.isAdmin()) {
      return <Redirect to={Routes.DASHBOARD} />;
    }

    return this.renderComponent(Component, props);
  }

  renderAppBody = () => {
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
            <Route path={Routes.DASHBOARD} render={() => this.renderComponent(Dashboard)} />
            <Route path={Routes.FORMS} render={() => this.renderComponent(Forms)} />
            <Route path={Routes.SETTINGS} render={() => this.renderIfAdmin(SettingsContainer)} />
            <Redirect to={Routes.DASHBOARD} />
          </Switch>
        </AppBodyWrapper>
      );
  }

  render() {
    const {
      app,
      loadAppReqState,
      selectedOrganizationSettings,
      selectedOrganizationTitle
    } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    const tool = includesPretrialModule ? 'Pretrial Case Management' : 'PSA Calculator';
    const loading = requestIsPending(loadAppReqState);
    const selectedOrg = app.get(APP_DATA.SELECTED_ORG_ID, '');
    const orgList = app.get(APP_DATA.ORGS).entrySeq().map(([value, organization]) => {
      const label = organization.get('title', '');
      return { label, value };
    });
    return (
      <AppWrapper>
        <HeaderNav
            loading={loading}
            logout={this.handleOnClickLogOut}
            organizations={orgList}
            pretrialModule={includesPretrialModule}
            selectedOrg={selectedOrg}
            switchOrg={this.switchOrganization} />
        <ContactSupport />
        { selectedOrganizationTitle ? <WelcomeBanner tool={tool} organization={selectedOrganizationTitle} /> : null }
        {this.renderAppBody()}
        <HearingSettingsModal />
      </AppWrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const charges = state.get(STATE.CHARGES);
  const hearings = state.get(STATE.HEARINGS);
  console.log(app.toJS());
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

    [HEARINGS_DATA.SETTINGS_MODAL_OPEN]: hearings.get(HEARINGS_DATA.SETTINGS_MODAL_OPEN)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(AppActionFactory).forEach((action :string) => {
    actions[action] = AppActionFactory[action];
  });

  Object.keys(ChargesActionFactory).forEach((action :string) => {
    actions[action] = ChargesActionFactory[action];
  });

  actions.loadJudges = loadJudges;
  actions.getStaffEKIDs = getStaffEKIDs;

  actions.logout = logout;
  actions.getAllPropertyTypes = getAllPropertyTypes;

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
