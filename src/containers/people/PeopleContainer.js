/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import PersonSearchFields from '../../components/person/PersonSearchFields';
import PersonTextAreaInput from '../../components/person/PersonTextAreaInput';
import PeopleList from '../../components/people/PeopleList';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import LoadingSpinner from '../../components/LoadingSpinner';
import NavButtonToolbar from '../../components/buttons/NavButtonToolbar';
import DropDownMenu from '../../components/StyledSelect';
import { searchPeopleRequest } from '../person/PersonActionFactory';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import { STATE, SEARCH, REVIEW, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { DOMAIN_OPTIONS_ARR } from '../../utils/consts/ReviewPSAConsts';
import { formatDOB } from '../../utils/Helpers';
import * as Routes from '../../core/router/Routes';
import * as ReviewActionFactory from '../review/ReviewActionFactory';

const SearchBox = styled.div`
  padding: 30px 0;
  margin-bottom: 30px;
  background: white;
  border: 1px solid #e1e1eb;
  border-radius: 5px;
`;

const MissingNamesContainer = styled.div`
  text-align: center;
  color: #ff3c5d;
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
  openPSAs :Immutable.Map<*, *>,
  psaNeighborsById :Immutable.Map<*, *>,
  actions :{
    loadPSAsByDate :(filter :string) => void,
    searchPeopleRequest :(firstName :string, lastName :string, dob :string) => void
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

  componentDidMount() {
    this.props.actions.loadPSAsByDate(PSA_STATUSES.OPEN);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.peopleResults !== this.props.peopleResults) {
      this.setState({ didMapPeopleToProps: true });
    }
  }

  formatPeopleInfo = (person) => {
    const formattedDOB = formatDOB(person.getIn([PROPERTY_TYPES.DOB, 0]));
    return {
      identification: person.getIn([PROPERTY_TYPES.PERSON_ID, 0]),
      firstName: person.getIn([PROPERTY_TYPES.FIRST_NAME, 0]),
      lastName: person.getIn([PROPERTY_TYPES.LAST_NAME, 0]),
      dob: formattedDOB,
      photo: person.getIn([PROPERTY_TYPES.PICTURE, 0])
    };
  }

  getFormattedPeople = (peopleList) => {
    const formattedPeople = peopleList.map(person => this.formatPeopleInfo(person));

    return formattedPeople;
  }

  renderSearchPeopleComponent = () => {
    const formattedPeople = this.getFormattedPeople(this.props.peopleResults);
    return (
      <div>
        <SearchBox>
          <PersonSearchFields handleSubmit={this.props.actions.searchPeopleRequest} />
        </SearchBox>
        <PeopleList
            people={formattedPeople}
            isFetchingPeople={this.props.isFetchingPeople}
            didMapPeopleToProps={this.state.didMapPeopleToProps} />
      </div>
    );
  }

  getFilteredPeopleList = () => {
    const { peopleList } = this.state;
    let peopleById = Immutable.Map();
    let missingPeople = Immutable.Set(peopleList);

    this.props.psaNeighborsById.valueSeq().forEach((neighbors) => {
      const neighbor = neighbors.getIn([ENTITY_SETS.PEOPLE, PSA_NEIGHBOR.DETAILS], Immutable.Map());
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

    const formattedPeople = this.getFormattedPeople(peopleById.valueSeq());

    return { formattedPeople, missingPeople };
  }

  renderMultiSearchPeopleComponent = () => {
    const { formattedPeople, missingPeople } = this.getFilteredPeopleList();

    return (
      <div>
        <SearchBox>
          <PersonTextAreaInput onChange={peopleList => this.setState({ peopleList })} />
          {
            missingPeople.size && !this.props.loadingPSAData ? (
              <MissingNamesContainer>
                <ErrorHeader>Missing names:</ErrorHeader>
                {missingPeople.map(person =>
                  (<div key={`${person.firstName}|${person.lastName}`}>{person.firstName} {person.lastName}</div>))}
              </MissingNamesContainer>
            ) : null
          }
        </SearchBox>
        {
          this.props.loadingPSAData ? <LoadingSpinner /> : (
            <PeopleList
                people={formattedPeople}
                isFetchingPeople={this.props.isFetchingPeople}
                didMapPeopleToProps={this.state.didMapPeopleToProps} />
          )
        }
      </div>
    );
  }

  getPeopleRequiringAction = () => {
    const { countyFilter } = this.state;

    let peopleById = Immutable.Map();

    this.props.psaNeighborsById.valueSeq().forEach((neighbors) => {
      const staffMatchingFilter = neighbors.get(ENTITY_SETS.STAFF, Immutable.List()).filter(neighbor =>
        neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID, 0], '').includes(countyFilter));

      if (!countyFilter.length || staffMatchingFilter.size) {
        const neighbor = neighbors.getIn([ENTITY_SETS.PEOPLE, PSA_NEIGHBOR.DETAILS], Immutable.Map());
        const personId = neighbor.get(PROPERTY_TYPES.PERSON_ID);
        if (personId) {
          peopleById = peopleById.set(personId, peopleById.get(personId, Immutable.List()).push(neighbor));
        }
      }
    });

    let people = Immutable.List();
    peopleById.valueSeq().forEach((personList) => {
      if (personList.size > 1) {
        people = people.push(personList.get(0));
      }
    });

    return this.getFormattedPeople(people);
  }

  renderRequiresActionPeopleComponent = () => {
    if (this.props.loadingPSAData) {
      return <LoadingSpinner />;
    }

    const formattedPeople = this.getPeopleRequiringAction();
    return (
      <PeopleList
          people={formattedPeople}
          isFetchingPeople={this.props.isFetchingPeople}
          didMapPeopleToProps={this.state.didMapPeopleToProps} />
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
        path: Routes.REQUIRES_ACTION_PEOPLE,
        label: 'Requires Action'
      },
      {
        path: Routes.SEARCH_PEOPLE,
        label: STATE.SEARCH
      },
      {
        path: Routes.MULTI_SEARCH_PEOPLE,
        label: 'Multi-Search'
      }
    ];

    return (
      <DashboardMainSection>
        <ToolbarWrapper>
          <NavButtonToolbar options={navButtons} />
          {this.renderCountyDropdown()}
        </ToolbarWrapper>
        <Switch>
          <Route path={Routes.REQUIRES_ACTION_PEOPLE} render={this.renderRequiresActionPeopleComponent} />
          <Route path={Routes.SEARCH_PEOPLE} render={this.renderSearchPeopleComponent} />
          <Route path={Routes.MULTI_SEARCH_PEOPLE} render={this.renderMultiSearchPeopleComponent} />
          <Redirect from={Routes.PEOPLE} to={Routes.REQUIRES_ACTION_PEOPLE} />
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
    psaNeighborsById
  };
}

function mapDispatchToProps(dispatch) {
  const actions :{ [string] :Function } = { searchPeopleRequest };

  Object.keys(ReviewActionFactory).forEach((action :string) => {
    actions[action] = ReviewActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PeopleContainer);
