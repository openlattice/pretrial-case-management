/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import type { RequestSequence } from 'redux-reqseq';
import { List, Map, Set } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import CheckInsContainer from '../checkins/CheckInsContainer';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import ManageHearingsContainer from '../hearings/ManageHearingsContainer';
import NavButtonToolbar from '../../components/buttons/NavButtonToolbar';
import PeopleList from '../../components/people/PeopleList';
import PersonSearchFields from '../../components/person/PersonSearchFields';
import RequiresActionList from './RequiresActionList';
import RequiresActionContainer from '../requiresaction/RequiresActionContainer';
import RemindersContainer from '../reminders/RemindersContainer';
import { getFormattedPeople } from '../../utils/PeopleUtils';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import REVIEW_DATA from '../../utils/consts/redux/ReviewConsts';
import { SEARCH, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';

import * as Routes from '../../core/router/Routes';
import { clearSearchResults, searchPeople } from '../person/PersonActions';

const PEOPLE_FQN = APP_TYPES.PEOPLE;

const SearchBox = styled.div`
  padding: 30px;
  margin-bottom: 30px;
  background: white;
  border: 1px solid ${OL.GREY11};
  border-radius: 5px;
`;

const ToolbarWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`;

type Props = {
  actions :{
    clearSearchResults :() => void;
    searchPeople :RequestSequence;
  };
  isFetchingPeople :boolean;
  peopleResults :List;
  psaNeighborsById :Map;
  selectedOrganizationSettings :Map;
};

type State = {
  didMapPeopleToProps :boolean,
  peopleList :string[]
};

class PeopleContainer extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);

    this.state = {
      didMapPeopleToProps: false,
      peopleList: []
    };
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.clearSearchResults();
  }

  componentDidUpdate(prevProps) {
    const { peopleResults } = this.props;
    if (prevProps.peopleResults !== peopleResults) {
      this.setState({ didMapPeopleToProps: true });
    }
  }

  renderSearchPeopleComponent = () => {
    const { didMapPeopleToProps } = this.state;
    const { peopleResults, actions, isFetchingPeople } = this.props;
    const formattedPeople = getFormattedPeople(peopleResults);
    return (
      <div>
        <SearchBox>
          <PersonSearchFields includePSAInfo handleSubmit={actions.searchPeople} />
        </SearchBox>
        <PeopleList
            people={formattedPeople}
            isFetchingPeople={isFetchingPeople}
            didMapPeopleToProps={didMapPeopleToProps} />
      </div>
    );
  }

  renderManageHearingsComponent = () => <ManageHearingsContainer />;

  getFilteredPeopleList = () => {
    const { psaNeighborsById } = this.props;
    const { peopleList } = this.state;
    let peopleById = Map();
    let missingPeople = Set(peopleList);

    psaNeighborsById.valueSeq().forEach((neighbors) => {
      const neighbor = neighbors.getIn([PEOPLE_FQN, PSA_NEIGHBOR.DETAILS], Map());
      const firstNameList = neighbor.get(PROPERTY_TYPES.FIRST_NAME, List()).map((val) => val.toLowerCase());
      const lastNameList = neighbor.get(PROPERTY_TYPES.LAST_NAME, List()).map((val) => val.toLowerCase());
      const id = neighbor.get(PROPERTY_TYPES.PERSON_ID);

      if (id) {
        peopleList.forEach((person) => {
          const { firstName, lastName } = person;
          if (firstNameList.includes(firstName) && lastNameList.includes(lastName)) {
            peopleById = peopleById.set(id, neighbor);
            missingPeople = missingPeople.remove(person);
          }
        });
      }
    });

    const formattedPeople = getFormattedPeople(peopleById.valueSeq());

    return { formattedPeople, missingPeople };
  }

  renderRequiresActionPeopleComponent = () => <RequiresActionContainer />;

  renderRemindersPortal = () => <RemindersContainer />;
  renderCheckInsPortal = () => <CheckInsContainer />;

  render() {
    const { selectedOrganizationSettings } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    const settingsIncludeVoiceEnroll = selectedOrganizationSettings.get(SETTINGS.ENROLL_VOICE, false);
    const courtRemindersEnabled = selectedOrganizationSettings.get(SETTINGS.COURT_REMINDERS, false);
    let remindersSwitchRoute = null;
    let checkInsSwitchRoute = null;

    let navButtons = [
      {
        path: Routes.SEARCH_PEOPLE,
        label: 'Search'
      }
    ];

    const pretrialModuleNavButtons = [
      {
        path: Routes.MANAGE_PEOPLE_HEARINGS,
        label: 'Manage Hearings'
      },
      {
        path: Routes.REQUIRES_ACTION_PEOPLE,
        label: 'Requires Action'
      }
    ];

    const remindersButton = {
      path: Routes.MANAGE_PEOPLE_REMINDERS,
      label: 'Court Reminders'
    };

    const checkInsButton = {
      path: Routes.MANAGE_PEOPLE_CHECKINS,
      label: 'Check-Ins'
    };

    if (includesPretrialModule) {
      navButtons = navButtons.concat(pretrialModuleNavButtons);
      if (courtRemindersEnabled) {
        navButtons.push(remindersButton);
        remindersSwitchRoute = <Route path={Routes.MANAGE_PEOPLE_REMINDERS} render={this.renderRemindersPortal} />;
      }
      if (settingsIncludeVoiceEnroll) {
        navButtons.push(checkInsButton);
        checkInsSwitchRoute = <Route path={Routes.MANAGE_PEOPLE_CHECKINS} render={this.renderCheckInsPortal} />;
      }
    }

    return (
      <DashboardMainSection>
        <ToolbarWrapper>
          { (navButtons.length > 1) && <NavButtonToolbar options={navButtons} />}
        </ToolbarWrapper>
        <Switch>
          <Route path={Routes.SEARCH_PEOPLE} render={this.renderSearchPeopleComponent} />
          <Route path={Routes.MANAGE_PEOPLE_HEARINGS} render={this.renderManageHearingsComponent} />
          <Route path={Routes.REQUIRES_ACTION_PEOPLE} render={this.renderRequiresActionPeopleComponent} />
          { remindersSwitchRoute }
          { checkInsSwitchRoute }
          <Redirect from={Routes.PEOPLE} to={Routes.SEARCH_PEOPLE} />
        </Switch>
      </DashboardMainSection>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const peopleResults = state.getIn([STATE.SEARCH, SEARCH.SEARCH_RESULTS], List());
  const isFetchingPeople = state.getIn([STATE.SEARCH, SEARCH.LOADING], false);
  const openPSAs = state.getIn([STATE.REVIEW, REVIEW_DATA.SCORES], Map());
  const psaNeighborsById = state.getIn([STATE.REVIEW, REVIEW_DATA.PSA_NEIGHBORS_BY_ID], Map());
  return {
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),
    peopleResults,
    isFetchingPeople,
    openPSAs,
    psaNeighborsById
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Hearings Actions
    searchPeople,
    clearSearchResults
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(PeopleContainer);
