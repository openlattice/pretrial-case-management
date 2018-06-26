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
import InnerNavLink from '../../components/InnerNavLink';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import LoadingSpinner from '../../components/LoadingSpinner';
import NavButtonToolbar from '../../components/buttons/NavButtonToolbar';
import { searchPeopleRequest } from '../person/PersonActionFactory';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { StyledInnerNav } from '../../utils/Layout';
import { formatDOB } from '../../utils/Helpers';
import * as Routes from '../../core/router/Routes';
import * as ReviewActionFactory from '../review/ReviewActionFactory';

const SearchBox = styled.div`
  padding: 30px 0;
  margin-bottom: 30px;
  background: white;
  box-shadow: 0 2px 8px -2px rgba(17,51,85,0.15);
  border: 1px solid #ccc;
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
      const neighbor = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map());
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
          <PersonTextAreaInput onChange={(peopleList) => this.setState({ peopleList })} />
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
    let peopleById = Immutable.Map();

    this.props.psaNeighborsById.valueSeq().forEach((neighbors) => {
      const neighbor = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map());
      const personId = neighbor.get(PROPERTY_TYPES.PERSON_ID);
      if (personId) {
        peopleById = peopleById.set(personId, peopleById.get(personId, Immutable.List()).push(neighbor));
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
      <DashboardMainSection header="People">
        <NavButtonToolbar options={navButtons} />
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
  const peopleResults = state.getIn(['search', 'searchResults'], Immutable.List());
  const isFetchingPeople = state.getIn(['search', 'isLoadingPeople'], false);
  const loadingPSAData = state.getIn(['review', 'loadingPSAData'], false);
  const openPSAs = state.getIn(['review', 'scoresAsMap'], Immutable.Map());
  const psaNeighborsById = state.getIn(['review', 'psaNeighborsById'], Immutable.Map());
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
