/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import SearchBar from '../../components/PSASearchBar';
import NewChargeModal from './NewChargeModal';
import ChargeTable from '../../components/managecharges/ChargeTable';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import NavButtonToolbar from '../../components/buttons/NavButtonToolbar';
import Pagination from '../../components/Pagination';
import { CHARGES } from '../../utils/consts/FrontEndStateConsts';
import { PrimaryButton } from '../../utils/Layout';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { CHARGE_TYPES } from '../../utils/consts/ChargeConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

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
  arrestCharges :Map<*, *>,
  arrestChargePermissions :boolean,
  courtCharges :Map<*, *>,
  courtChargePermissions :boolean,
  selectedOrganizationId :string,
  location :Object,
};

const MAX_RESULTS = 20;

class ManageChargesContainer extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      chargeType: CHARGE_TYPES.ARREST,
      newChargeModalOpen: false,
      searchQuery: '',
      start: 0
    };
  }

  switchToArrestChargeType = () => (this.setState({ chargeType: CHARGE_TYPES.ARREST, start: 0 }))
  switchToCourtChargeType = () => (this.setState({ chargeType: CHARGE_TYPES.COURT, start: 0 }))

  componentDidUpdate(prevProps) {
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

  handleOnChangeSearchQuery = (event :SyntheticInputEvent<*>) => {
    let { start } = this.state;
    const { numPages } = this.getChargeList();
    const currPage = (start / MAX_RESULTS) + 1;
    if (currPage > numPages) start = (numPages - 1) * MAX_RESULTS;
    if (start <= 0) start = 0;
    this.setState({
      searchQuery: event.target.value,
      start
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

  updatePage = (start) => {
    this.setState({ start });
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  renderPagination = () => {
    const { start } = this.state;
    const { numPages } = this.getChargeList();
    const currPage = (start / MAX_RESULTS) + 1;
    return (
      <Pagination
          numPages={numPages}
          activePage={currPage}
          updateStart={this.updateStart}
          onChangePage={(page) => this.updatePage((page - 1) * MAX_RESULTS)} />
    );
  }

  getChargeList = () => {
    const { chargeType } = this.state;
    const { arrestCharges, courtCharges, selectedOrganizationId } = this.props;
    let charges;
    if (chargeType === CHARGE_TYPES.ARREST) {
      charges = arrestCharges.get(selectedOrganizationId, Map());
    }
    else if (chargeType === CHARGE_TYPES.COURT) {
      charges = courtCharges.get(selectedOrganizationId, Map());
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
        { this.renderNewChargeModal() }
        <ToolbarWrapper>
          <NavButtonToolbar options={navButtons} />
          { this.renderCreateButton() }
        </ToolbarWrapper>
        <SubToolbarWrapper>
          { this.renderChargeSearch() }
          { this.renderPagination() }
        </SubToolbarWrapper>
        <Switch>
          <Route path={arrestRoute} render={this.renderCharges} />
          <Route path={courtRoute} render={this.renderCharges} />
          <Redirect from={Routes.CHARGE_SETTINGS} to={arrestRoute} />
        </Switch>
        <SubToolbarWrapper>
          <div />
          { this.renderPagination() }
        </SubToolbarWrapper>
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
    [CHARGES.ARREST]: charges.get(CHARGES.ARREST),
    [CHARGES.ARREST_PERMISSIONS]: charges.get(CHARGES.ARREST_PERMISSIONS),
    [CHARGES.COURT]: charges.get(CHARGES.COURT),
    [CHARGES.COURT_PERMISSIONS]: charges.get(CHARGES.COURT_PERMISSIONS)
  };
}

export default connect(mapStateToProps, null)(ManageChargesContainer);
