/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import SearchBar from '../../components/PSASearchBar';
import NewChargeModal from '../../components/managecharges/NewChargeModal';
import ChargeTable from '../../components/managecharges/ChargeTable';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import NavButtonToolbar from '../../components/buttons/NavButtonToolbar';
import { PrimaryButton } from '../../utils/Layout';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { CHARGE_TYPES } from '../../utils/consts/ChargeConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { CHARGE_DATA } from '../../utils/consts/redux/ChargeConsts';

import * as Routes from '../../core/router/Routes';

const ToolbarWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
`;

const SubToolbarWrapper = styled(ToolbarWrapper)`
  margin-right: -30px;
`;

type Props = {
  arrestChargesById :Map;
  arrestChargePermissions :string;
  courtChargesById :Map;
  courtChargePermissions :boolean;
  selectedOrganizationId :string;
  location :Object;
};

type State = {
  charge :Map;
  chargeType :string;
  newChargeModalOpen :boolean;
  searchQuery :string;
}

const MAX_RESULTS = 20;

class ManageChargesContainer extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      charge: Map(),
      chargeType: CHARGE_TYPES.ARREST,
      newChargeModalOpen: false,
      searchQuery: '',
    };
  }

  switchToArrestChargeType = () => (this.setState({ chargeType: CHARGE_TYPES.ARREST }))
  switchToCourtChargeType = () => (this.setState({ chargeType: CHARGE_TYPES.COURT }))

  componentDidMount() {
    const { location } = this.props;
    const path = location.pathname;
    if (path.endsWith(Routes.ARREST_CHARGES)) {
      this.switchToArrestChargeType();
    }
    else if (path.endsWith(Routes.COURT_CHARGES)) {
      this.switchToCourtChargeType();
    }
  }

  componentDidUpdate(prevProps :Props) {
    const { location } = this.props;
    const path = location.pathname;
    const prevPath = prevProps.location.pathname;
    const pathsDoNotMatch = path !== prevPath;
    if (pathsDoNotMatch && path.endsWith(Routes.ARREST_CHARGES)) {
      this.switchToArrestChargeType();
    }
    else if (pathsDoNotMatch && path.endsWith(Routes.COURT_CHARGES)) {
      this.switchToCourtChargeType();
    }
  }

  getChargePermission = () => {
    const { chargeType } = this.state;
    const { arrestChargePermissions, courtChargePermissions } = this.props;
    const hasArrestPermission = (chargeType === CHARGE_TYPES.ARREST && arrestChargePermissions);
    const hasCourtPermission = (chargeType === CHARGE_TYPES.COURT && courtChargePermissions);
    return (hasArrestPermission || hasCourtPermission);
  }

  renderCreateButton = () => {
    let button = null;
    const hasPermission = this.getChargePermission();
    if (hasPermission) {
      button = (
        <PrimaryButton onClick={this.openChargeModal}>
          Add New Charge
        </PrimaryButton>
      );
    }
    return button;
  }

  handleOnChangeSearchQuery = (event :SyntheticInputEvent<*>) => this.setState({
    searchQuery: event.target.value
  });

  openChargeModal = (charge :Map) => {
    const hasPermission = this.getChargePermission();
    console.log(charge);
    if (hasPermission) this.setState({ charge, newChargeModalOpen: true });
  };

  closeChargeModal = () => (this.setState({ charge: Map(), newChargeModalOpen: false }))

  renderNewChargeModal = () => {
    const { charge, newChargeModalOpen, chargeType } = this.state;
    return (
      <NewChargeModal
          charge={charge}
          chargeType={chargeType}
          onClose={this.closeChargeModal}
          open={newChargeModalOpen} />
    );
  }

  handleFilterRequest = (charges :List) => {
    const { searchQuery } = this.state;
    let matchesStatute;
    let matchesDescription;
    let nextCharges = charges
      .sortBy((charge) => charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION, 0], ''))
      .sortBy((charge) => charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE, 0], ''));
    if (searchQuery) {
      nextCharges = nextCharges.filter((charge) => {
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
    return nextCharges;
  }

  renderChargeSearch = () => (
    <SearchBar onChange={this.handleOnChangeSearchQuery} />
  )

  getChargeList = () => {
    const { chargeType } = this.state;
    const { arrestChargesById, courtChargesById, selectedOrganizationId } = this.props;
    let charges;
    if (chargeType === CHARGE_TYPES.ARREST) {
      charges = arrestChargesById.get(selectedOrganizationId, Map());
    }
    else if (chargeType === CHARGE_TYPES.COURT) {
      charges = courtChargesById.get(selectedOrganizationId, Map());
    }
    charges = this.handleFilterRequest(charges);
    const numResults = charges.length || charges.size;
    const numPages = Math.ceil(numResults / MAX_RESULTS);
    return { charges, numResults, numPages };
  }


  renderCharges = () => {
    const { chargeType } = this.state;
    const { charges } = this.getChargeList();
    return (
      <ChargeTable
          openChargeModal={this.openChargeModal}
          charges={charges}
          chargeType={chargeType} />
    );
  }

  render() {
    const arrestRoute = `${Routes.CHARGE_SETTINGS}${Routes.ARREST_CHARGES}`;
    const courtRoute = `${Routes.CHARGE_SETTINGS}${Routes.COURT_CHARGES}`;

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
          { this.renderCreateButton() }
        </ToolbarWrapper>
        <SubToolbarWrapper>
          { this.renderChargeSearch() }
        </SubToolbarWrapper>
        <Switch>
          <Route path={arrestRoute} render={this.renderCharges} />
          <Route path={courtRoute} render={this.renderCharges} />
          <Redirect from={Routes.CHARGE_SETTINGS} to={arrestRoute} />
        </Switch>
        { this.renderNewChargeModal() }
      </DashboardMainSection>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const charges = state.get(STATE.CHARGES);

  return {
    // App
    [APP_DATA.ORGS]: app.get(APP_DATA.ORGS),
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),

    // Charges
    [CHARGE_DATA.ARREST_CHARGES_BY_ID]: charges.get(CHARGE_DATA.ARREST_CHARGES_BY_ID),
    [CHARGE_DATA.ARREST_PERMISSIONS]: charges.get(CHARGE_DATA.ARREST_PERMISSIONS),
    [CHARGE_DATA.COURT_CHARGES_BY_ID]: charges.get(CHARGE_DATA.COURT_CHARGES_BY_ID),
    [CHARGE_DATA.COURT_PERMISSIONS]: charges.get(CHARGE_DATA.COURT_PERMISSIONS)
  };
}

// $FlowFixMe
export default connect(mapStateToProps, null)(ManageChargesContainer);
