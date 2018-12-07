/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map, List } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import ChargeTable from '../../components/managecharges/ChargeTable';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import NavButtonToolbar from '../../components/buttons/NavButtonToolbar';
import { APP, CHARGES, STATE } from '../../utils/consts/FrontEndStateConsts';
import { CHARGE_TYPES } from '../../utils/consts/ChargeConsts';

import * as Routes from '../../core/router/Routes';
import * as AppActionFactory from '../app/AppActionFactory';
import * as ChargesActionFactory from './ChargesActionFactory';


const ToolbarWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`;

type Props = {
  arrestCharges :Map<*, *>,
  courtCharges :Map<*, *>,
  selectedOrganizationId :string,
  actions :{
    loadApp :RequestSequence;
    loadCharges :RequestSequence;
    switchOrganization :(orgId :string) => Object;
    logout :() => void;
  };
};

class ManageChargesContainer extends React.Component<Props, *> {

  renderArrestCharges = () => {
    const { arrestCharges, selectedOrganizationId } = this.props;
    return (
      <ChargeTable
          charges={arrestCharges.get(selectedOrganizationId, List())}
          chargeType={CHARGE_TYPES.ARREST}
          disabled />
    );
  }
  renderCourtCharges = () => {
    const { courtCharges, selectedOrganizationId } = this.props;
    return (
      <ChargeTable
          charges={courtCharges.get(selectedOrganizationId, List())}
          chargeType={CHARGE_TYPES.COURT}
          disabled />
    );
  }

  render() {
    const arrestRoute = `${Routes.MANAGE_CHARGES}${Routes.ARREST_CHARGES}`;
    const courtRoute = `${Routes.MANAGE_CHARGES}${Routes.COURT_CHARGES}`;

    const navButtons = [
      {
        path: arrestRoute,
        label: 'Arrest'
      },
      {
        path: courtRoute,
        label: 'Court'
      }
    ];

    return (
      <DashboardMainSection>
        <ToolbarWrapper>
          <NavButtonToolbar options={navButtons} />
        </ToolbarWrapper>
        <Switch>
          <Route path={arrestRoute} render={this.renderArrestCharges} />
          <Route path={courtRoute} render={this.renderCourtCharges} />
          <Redirect from={Routes.MANAGE_CHARGES} to={arrestRoute} />
        </Switch>
      </DashboardMainSection>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const charges = state.get(STATE.CHARGES);

  return {
    // App
    [APP.SELECTED_ORG_ID]: app.get(APP.SELECTED_ORG_ID),
    [APP.SELECTED_ORG_TITLE]: app.get(APP.SELECTED_ORG_TITLE),

    // Charges
    [CHARGES.ARREST]: charges.get(CHARGES.ARREST),
    [CHARGES.COURT]: charges.get(CHARGES.COURT)
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

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageChargesContainer);
