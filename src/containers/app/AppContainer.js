/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { AuthActions } from 'lattice-auth';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { EntityDataModelApiActions } from 'lattice-sagas';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Map } from 'immutable';

import AppConsent from './AppConsent';
import ErrorPage from '../../components/ErrorPage';
import HeaderNav from '../../components/nav/HeaderNav';
import Dashboard from '../../components/dashboard/Dashboard';
import Forms from '../forms/Forms';
import ContactSupport from '../../components/app/ContactSupport';
import LogoLoader from '../../components/LogoLoader';
import { APP, CHARGES, STATE } from '../../utils/consts/FrontEndStateConsts';
import { APP_TYPES_FQNS, SETTINGS, MODULE } from '../../utils/consts/DataModelConsts';
import { termsAreAccepted } from '../../utils/AcceptTermsUtils';
import { OL } from '../../utils/consts/Colors';

import * as Routes from '../../core/router/Routes';
import * as AppActionFactory from './AppActionFactory';
import * as CourtActionFactory from '../court/CourtActionFactory';
import * as ChargesActionFactory from '../charges/ChargesActionFactory';

const { logout } = AuthActions;
const { getAllPropertyTypes } = EntityDataModelApiActions;

const {
  JUDGES,
  ARREST_CHARGE_LIST,
  COURT_CHARGE_LIST
} = APP_TYPES_FQNS;

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
  errors :Map<*, *>,
  actions :{
    getAllPropertyTypes :RequestSequence;
    loadApp :RequestSequence;
    loadCharges :RequestSequence;
    switchOrganization :(orgId :string) => Object;
    logout :() => void;
  };
};

class AppContainer extends React.Component<Props, *> {

  componentDidMount() {
    const { actions } = this.props;
    actions.loadApp();
    actions.getAllPropertyTypes();
  }

  componentDidUpdate(prevProps) {
    const { app, actions } = this.props;
    const nextOrg = app.get(APP.ORGS);
    const prevOrg = prevProps.app.get(APP.ORGS);
    if (prevOrg.size !== nextOrg.size) {
      nextOrg.keySeq().forEach((id) => {
        const selectedOrgId :string = id;
        const arrestChargesEntitySetId = app.getIn(
          [ARREST_CHARGE_LIST.toString(), APP.ENTITY_SETS_BY_ORG, selectedOrgId]
        );
        const courtChargesEntitySetId = app.getIn(
          [COURT_CHARGE_LIST.toString(), APP.ENTITY_SETS_BY_ORG, selectedOrgId]
        );
        const judgesEntitySetId = app.getIn(
          [JUDGES.toString(), APP.ENTITY_SETS_BY_ORG, selectedOrgId]
        );
        if (arrestChargesEntitySetId && courtChargesEntitySetId) {
          actions.loadCharges({
            arrestChargesEntitySetId,
            courtChargesEntitySetId,
            selectedOrgId
          });
        }
        if (judgesEntitySetId) {
          actions.loadJudges();
        }
      });
    }
  }

  switchOrganization = (organization) => {
    const { actions, app, appSettingsByOrgId } = this.props;
    const selectedOrganizationId = app.get(APP.SELECTED_ORG_ID);
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

  renderAppBody = () => {
    const { app, errors } = this.props;
    const loading = app.get(APP.LOADING, false);
    const error = errors.get('loadApp', '').toString();

    if (error.length) {
      return (
        <ErrorPage error={error} />
      );
    }

    return loading
      ? <LogoLoader loadingText="Loading..." />
      : (
        <AppBodyWrapper>
          <Switch>
            <Route path={Routes.TERMS} component={AppConsent} />
            <Route path={Routes.DASHBOARD} render={() => this.renderComponent(Dashboard)} />
            <Route path={Routes.FORMS} render={() => this.renderComponent(Forms)} />
            <Redirect to={Routes.DASHBOARD} />
          </Switch>
        </AppBodyWrapper>
      );
  }

  render() {
    const { actions, app, selectedOrganizationSettings } = this.props;
    const pretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    const loading = app.get(APP.LOADING, false);
    const selectedOrg = app.get(APP.SELECTED_ORG_ID, '');
    const orgList = app.get(APP.ORGS).entrySeq().map(([value, organization]) => {
      const label = organization.get('title', '');
      return { label, value };
    });
    return (
      <AppWrapper>
        <HeaderNav
            loading={loading}
            logout={actions.logout}
            organizations={orgList}
            pretrialModule={pretrialModule}
            selectedOrg={selectedOrg}
            switchOrg={this.switchOrganization} />
        <ContactSupport />
        {this.renderAppBody()}
      </AppWrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const charges = state.get(STATE.CHARGES);
  return {
    app,
    [APP.SELECTED_ORG_ID]: app.get(APP.APP_SETTINGS_ID),
    [APP.SETTINGS_BY_ORG_ID]: app.get(APP.SETTINGS_BY_ORG_ID),
    [APP.SELECTED_ORG_SETTINGS]: app.get(APP.SELECTED_ORG_SETTINGS),
    [APP.ERRORS]: app.get(APP.ERRORS),

    [CHARGES.ARREST]: charges.get(CHARGES.ARREST),
    [CHARGES.COURT]: charges.get(CHARGES.COURT),
    [CHARGES.LOADING]: charges.get(CHARGES.LOADING)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(AppActionFactory).forEach((action :string) => {
    actions[action] = AppActionFactory[action];
  });

  Object.keys(CourtActionFactory).forEach((action :string) => {
    actions[action] = CourtActionFactory[action];
  });

  Object.keys(ChargesActionFactory).forEach((action :string) => {
    actions[action] = ChargesActionFactory[action];
  });

  actions.logout = logout;
  actions.getAllPropertyTypes = getAllPropertyTypes;

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
