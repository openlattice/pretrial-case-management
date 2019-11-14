/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import RequiresActionList from './RequiresActionList';
import RemindersContainer from '../reminders/RemindersContainer';
import CheckInsContainer from '../checkins/CheckInsContainer';
import PersonSearchFields from '../../components/person/PersonSearchFields';
import PersonTextAreaInput from '../../components/person/PersonTextAreaInput';
import PeopleList from '../../components/people/PeopleList';
import ManageHearingsContainer from '../hearings/ManageHearingsContainer';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import LogoLoader from '../../components/LogoLoader';
import NavButtonToolbar from '../../components/buttons/NavButtonToolbar';
import { getFormattedPeople } from '../../utils/PeopleUtils';
import { clearSearchResults, searchPeople } from '../person/PersonActions';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import {
  SEARCH,
  PEOPLE,
  REVIEW,
  PSA_NEIGHBOR
} from '../../utils/consts/FrontEndStateConsts';

import * as Routes from '../../core/router/Routes';

const PEOPLE_FQN = APP_TYPES.PEOPLE;

const SearchBox = styled.div`
  padding: 30px 0;
  margin-bottom: 30px;
  background: white;
  border: 1px solid ${OL.GREY11};
  border-radius: 5px;
`;

const MissingNamesContainer = styled.div`
  text-align: center;
  color: ${OL.RED01};
`;

const ErrorHeader = styled.div`
  margin: 10px 0;
  font-weight: bold;
  font-size: 16px;
  text-decoration: underline;
`;

const ToolbarWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`;

type Props = {
  isFetchingPeople :boolean,
  peopleResults :Immutable.List<*>,
  loadingPSAData :boolean,
  psaNeighborsById :Immutable.Map<*, *>,
  selectedOrganizationSettings :Immutable.Map<*, *>,
  actions :{
    loadPSAsByDate :(filter :string) => void,
    searchPeople :(value :{firstName :string, lastName :string, dob :string}) => void
  }
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

  componentWillReceiveProps(nextProps) {
    const { peopleResults } = this.props;
    if (nextProps.peopleResults !== peopleResults) {
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

  renderManageHearingsComponentComponent = () => <ManageHearingsContainer />;

  getFilteredPeopleList = () => {
    const { psaNeighborsById } = this.props;
    const { peopleList } = this.state;
    let peopleById = Immutable.Map();
    let missingPeople = Immutable.Set(peopleList);

    psaNeighborsById.valueSeq().forEach((neighbors) => {
      const neighbor = neighbors.getIn([PEOPLE_FQN, PSA_NEIGHBOR.DETAILS], Immutable.Map());
      const firstNameList = neighbor.get(PROPERTY_TYPES.FIRST_NAME, Immutable.List()).map(val => val.toLowerCase());
      const lastNameList = neighbor.get(PROPERTY_TYPES.LAST_NAME, Immutable.List()).map(val => val.toLowerCase());
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

  renderMultiSearchPeopleComponent = () => {
    const { loadingPSAData, isFetchingPeople } = this.props;
    const { didMapPeopleToProps } = this.state;
    const { formattedPeople, missingPeople } = this.getFilteredPeopleList();

    return (
      <div>
        <SearchBox>
          <PersonTextAreaInput onChange={peopleList => this.setState({ peopleList })} />
          {
            missingPeople.size && !loadingPSAData ? (
              <MissingNamesContainer>
                <ErrorHeader>Missing names:</ErrorHeader>
                {missingPeople
                  .map(person => (
                    <div key={`${person.firstName}|${person.lastName}`}>
                      {person.firstName}
                      {person.lastName}
                    </div>
                  ))}
              </MissingNamesContainer>
            ) : null
          }
        </SearchBox>
        {
          loadingPSAData ? <LogoLoader loadingText="Loading People..." /> : (
            <PeopleList
                people={formattedPeople}
                isFetchingPeople={isFetchingPeople}
                didMapPeopleToProps={didMapPeopleToProps} />
          )
        }
      </div>
    );
  }

  renderRequiresActionPeopleComponent = () => <RequiresActionList />;

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
        path: Routes.MULTI_SEARCH_PEOPLE,
        label: 'Multi-Search'
      },
      {
        path: Routes.MANAGE_HEARINGS,
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
          <NavButtonToolbar options={navButtons} />
        </ToolbarWrapper>
        <Switch>
          <Route path={Routes.SEARCH_PEOPLE} render={this.renderSearchPeopleComponent} />
          <Route path={Routes.MULTI_SEARCH_PEOPLE} render={this.renderMultiSearchPeopleComponent} />
          <Route path={Routes.MANAGE_HEARINGS} render={this.renderManageHearingsComponent} />
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
  const peopleResults = state.getIn([STATE.SEARCH, SEARCH.SEARCH_RESULTS], Immutable.List());
  const isFetchingPeople = state.getIn([STATE.SEARCH, SEARCH.LOADING], false);
  const loadingPSAData = state.getIn([STATE.REVIEW, REVIEW.LOADING_DATA], false);
  const openPSAs = state.getIn([STATE.REVIEW, REVIEW.SCORES], Immutable.Map());
  const psaNeighborsById = state.getIn([STATE.REVIEW, REVIEW.PSA_NEIGHBORS_BY_ID], Immutable.Map());
  return {
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),
    peopleResults,
    isFetchingPeople,
    loadingPSAData,
    openPSAs,
    psaNeighborsById
  };
}

function mapDispatchToProps(dispatch) {
  const actions :{ [string] :Function } = { searchPeople, clearSearchResults };

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PeopleContainer);
