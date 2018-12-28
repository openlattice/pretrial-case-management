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
import PersonSearchFields from '../../components/person/PersonSearchFields';
import PersonTextAreaInput from '../../components/person/PersonTextAreaInput';
import PeopleList from '../../components/people/PeopleList';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import LoadingSpinner from '../../components/LoadingSpinner';
import NavButtonToolbar from '../../components/buttons/NavButtonToolbar';
import DropDownMenu from '../../components/StyledSelect';
import { getFormattedPeople } from '../../utils/PeopleUtils';
import { clearSearchResults, searchPeople } from '../person/PersonActionFactory';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { DOMAIN_OPTIONS_ARR } from '../../utils/consts/ReviewPSAConsts';
import { OL } from '../../utils/consts/Colors';
import {
  STATE,
  SEARCH,
  PEOPLE,
  REVIEW,
  PSA_NEIGHBOR
} from '../../utils/consts/FrontEndStateConsts';

import * as Routes from '../../core/router/Routes';

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

const FilterWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  white-space: nowrap;
  width: 13%;
  margin-top: -10px;
`;

type Props = {
  isFetchingPeople :boolean,
  peopleResults :Immutable.List<*>,
  loadingPSAData :boolean,
  psaNeighborsById :Immutable.Map<*, *>,
  actions :{
    loadPSAsByDate :(filter :string) => void,
    searchPeople :(value :{firstName :string, lastName :string, dob :string}) => void
  }
};

type State = {
  didMapPeopleToProps :boolean,
  countyFilter :string,
  peopleList :string[]
};

class PeopleContainer extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);

    this.state = {
      didMapPeopleToProps: false,
      countyFilter: '',
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
          <PersonSearchFields handleSubmit={actions.searchPeople} />
        </SearchBox>
        <PeopleList
            people={formattedPeople}
            isFetchingPeople={isFetchingPeople}
            didMapPeopleToProps={didMapPeopleToProps} />
      </div>
    );
  }

  getFilteredPeopleList = () => {
    const { psaNeighborsById } = this.props;
    const { peopleList } = this.state;
    let peopleById = Immutable.Map();
    let missingPeople = Immutable.Set(peopleList);

    psaNeighborsById.valueSeq().forEach((neighbors) => {
      const neighbor = neighbors.getIn([APP_TYPES_FQNS.PEOPLE, PSA_NEIGHBOR.DETAILS], Immutable.Map());
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
          loadingPSAData ? <LoadingSpinner /> : (
            <PeopleList
                people={formattedPeople}
                isFetchingPeople={isFetchingPeople}
                didMapPeopleToProps={didMapPeopleToProps} />
          )
        }
      </div>
    );
  }

  renderRequiresActionPeopleComponent = () => {
    const { loadingPSAData, isFetchingPeople } = this.props;
    const { didMapPeopleToProps, countyFilter } = this.state;
    return (
      <RequiresActionList
          countyFilter={countyFilter}
          didMapPeopleToProps={didMapPeopleToProps}
          isLoadingPeople={isFetchingPeople}
          loadingPSAData={loadingPSAData} />
    );
  }

  renderCountyDropdown = () => {
    if (!window.location.href.includes(Routes.REQUIRES_ACTION_PEOPLE)) {
      return null;
    }
    return (
      <FilterWrapper>
        <DropDownMenu
            placeholder="All counties"
            classNamePrefix="lattice-select"
            options={DOMAIN_OPTIONS_ARR}
            onChange={e => this.setState({ countyFilter: e.value })} />
      </FilterWrapper>
    );
  }

  render() {
    const navButtons = [
      {
        path: Routes.SEARCH_PEOPLE,
        label: 'Search'
      },
      {
        path: Routes.MULTI_SEARCH_PEOPLE,
        label: 'Multi-Search'
      },
      {
        path: Routes.REQUIRES_ACTION_PEOPLE,
        label: 'Requires Action'
      }
    ];

    return (
      <DashboardMainSection>
        <ToolbarWrapper>
          <NavButtonToolbar options={navButtons} />
          {this.renderCountyDropdown()}
        </ToolbarWrapper>
        <Switch>
          <Route path={Routes.SEARCH_PEOPLE} render={this.renderSearchPeopleComponent} />
          <Route path={Routes.MULTI_SEARCH_PEOPLE} render={this.renderMultiSearchPeopleComponent} />
          <Route path={Routes.REQUIRES_ACTION_PEOPLE} render={this.renderRequiresActionPeopleComponent} />
          <Redirect from={Routes.PEOPLE} to={Routes.SEARCH_PEOPLE} />
        </Switch>
      </DashboardMainSection>
    );
  }
}


function mapStateToProps(state) {
  const peopleResults = state.getIn([STATE.SEARCH, SEARCH.SEARCH_RESULTS], Immutable.List());
  const isFetchingPeople = state.getIn([STATE.SEARCH, SEARCH.LOADING], false);
  const loadingPSAData = state.getIn([STATE.REVIEW, REVIEW.LOADING_DATA], false);
  const openPSAs = state.getIn([STATE.REVIEW, REVIEW.SCORES], Immutable.Map());
  const psaNeighborsById = state.getIn([STATE.REVIEW, REVIEW.NEIGHBORS_BY_ID], Immutable.Map());
  return {
    peopleResults,
    isFetchingPeople,
    loadingPSAData,
    openPSAs,
    psaNeighborsById,
    [PEOPLE.SCORES_ENTITY_SET_ID]: state.getIn([STATE.REVIEW, REVIEW.ENTITY_SET_ID], Immutable.Map())
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
