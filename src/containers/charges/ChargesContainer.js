/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import SearchBar from '../../components/PSASearchBar';
import NewChargeModal from './NewChargeModal';
import ChargeTable from '../../components/managecharges/ChargeTable';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import NavButtonToolbar from '../../components/buttons/NavButtonToolbar';
import { APP, CHARGES, STATE } from '../../utils/consts/FrontEndStateConsts';
import { PrimaryButton } from '../../utils/Layout';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
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
  location :Object,
  actions :{
    loadApp :RequestSequence;
    loadCharges :RequestSequence;
    switchOrganization :(orgId :string) => Object;
    logout :() => void;
  };
};

class ManageChargesContainer extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      chargeType: CHARGE_TYPES.ARREST,
      newChargeModalOpen: false,
      editing: false,
      searchQuery: ''
    };
  }

  switchToArrestChargeType = () => (this.setState({ chargeType: CHARGE_TYPES.ARREST }))
  switchToCourtChargeType = () => (this.setState({ chargeType: CHARGE_TYPES.COURT }))

  componentWillReceiveProps(nextProps) {
    const { location } = nextProps;
    const path = location.pathname;
    if (path.endsWith(Routes.ARREST_CHARGES)) {
      this.switchToArrestChargeType();
    }
    else if (path.endsWith(Routes.COURT_CHARGES)) {
      this.switchToCourtChargeType();
    }
  }

  editCharges = () => (this.setState({ editing: true }));
  cancelEditCharges = () => (this.setState({ editing: false }));

  renderCreateButton = () => (
    <PrimaryButton onClick={this.openChargeModal}>
      Add New Charge
    </PrimaryButton>
  )

  handleOnChangeSearchQuery = (event :SyntheticInputEvent<*>) => {
    this.setState({
      searchQuery: event.target.value
    });
  }

  openChargeModal = () => (this.setState({ newChargeModalOpen: true }))
  closeChargeModal = () => (this.setState({ newChargeModalOpen: false }))

  renderNewChargeModal = () => {
    const { newChargeModalOpen, chargeType } = this.state;
    return (
      <NewChargeModal
          chargeType={chargeType}
          creatingNew
          onClose={this.closeChargeModal}
          open={newChargeModalOpen} />
    );
  }


  handleFilterRequest = (charges) => {
    const { searchQuery } = this.state;
    let matchesStatute;
    let matchesDescription;
    if (!searchQuery) return charges;
    return charges.filter((charge) => {
      const statute = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION, 0]);
      const description = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE, 0]);
      if (statute) {
        matchesStatute = statute.toLowerCase().includes(searchQuery.toLowerCase());
      }
      if (description) {
        matchesDescription = description.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return matchesStatute || matchesDescription;
    });
  }

  renderChargeSearch = () => (
    <SearchBar onChange={this.handleOnChangeSearchQuery} />
  )


  renderArrestCharges = () => {
    const { editing } = this.state;
    const { arrestCharges, selectedOrganizationId } = this.props;
    const charges = this.handleFilterRequest(
      arrestCharges.get(selectedOrganizationId, Map()).valueSeq()
    );

    return (
      <ChargeTable
          charges={charges}
          chargeType={CHARGE_TYPES.ARREST}
          disabled={!editing} />
    );
  }
  renderCourtCharges = () => {
    const { editing } = this.state;
    const { courtCharges, selectedOrganizationId } = this.props;
    const charges = this.handleFilterRequest(
      courtCharges.get(selectedOrganizationId, Map()).valueSeq()
    );
    return (
      <ChargeTable
          charges={charges}
          chargeType={CHARGE_TYPES.COURT}
          disabled={!editing} />
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
        { this.renderNewChargeModal() }
        <ToolbarWrapper>
          <NavButtonToolbar options={navButtons} />
          {/* { this.renderEditButtons() } */}
        </ToolbarWrapper>
        <ToolbarWrapper>
          { this.renderChargeSearch() }
          { this.renderCreateButton() }
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
    [APP.ORGS]: app.get(APP.ORGS),
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
