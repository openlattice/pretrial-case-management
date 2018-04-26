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
import PeopleList from '../../components/people/PeopleList';
import InnerNavLink from '../../components/InnerNavLink';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import { getPeople } from './PeopleActionFactory';
import { searchPeopleRequest } from '../person/PersonActionFactory';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { StyledInnerNav } from '../../utils/Layout';
import { formatDOB } from '../../utils/Helpers';
import * as Routes from '../../core/router/Routes';

const SearchBox = styled.div`
  padding: 30px 0;
  margin-bottom: 30px;
  background: white;
  box-shadow: 0 2px 8px -2px rgba(17,51,85,0.15);
  border: 1px solid #ccc;
  border-radius: 5px;
`;

type Props = {
  isFetchingPeople :boolean,
  peopleResults :Immutable.List<*>,
  actions :{
    getPeople :() => void,
    searchPeopleRequest :(firstName :string, lastName :string, dob :string) => void
  }
};

type State = {
  didMapPeopleToProps :boolean
};

class PeopleContainer extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);

    this.state = {
      didMapPeopleToProps: false
    };
  }

  componentDidMount() {
    this.props.actions.getPeople();
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

  getFormattedPeople = () => {
    const formattedPeople = this.props.peopleResults.map(person => this.formatPeopleInfo(person));

    return formattedPeople;
  }

  renderCurrentPeopleComponent = () => {
    const formattedPeople = this.getFormattedPeople();
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

  // TODO: Update these once there is actually a property / list of incoming & past people
  renderIncomingPeopleComponent = () => {
    const formattedPeople = this.getFormattedPeople();

    return (
      <PeopleList
          people={formattedPeople}
          isFetchingPeople={this.props.isFetchingPeople}
          didMapPeopleToProps={this.state.didMapPeopleToProps} />
    );
  }

  renderPastPeopleComponent = () => {
    const formattedPeople = this.getFormattedPeople();

    return (
      <PeopleList
          people={formattedPeople}
          isFetchingPeople={this.props.isFetchingPeople}
          didMapPeopleToProps={this.state.didMapPeopleToProps} />
    );
  }

  render() {
    return (
      <DashboardMainSection header="People">
        <StyledInnerNav>
          <InnerNavLink
              path={Routes.CURRENT_PEOPLE}
              name={Routes.CURRENT_PEOPLE}
              label="Current" />
        </StyledInnerNav>
        <Switch>
          <Route path={Routes.CURRENT_PEOPLE} render={this.renderCurrentPeopleComponent} />
          <Route path={Routes.INCOMING_PEOPLE} render={this.renderIncomingPeopleComponent} />
          <Route path={Routes.PAST_PEOPLE} render={this.renderPastPeopleComponent} />
          <Redirect from={Routes.PEOPLE} to={Routes.CURRENT_PEOPLE} />
        </Switch>
      </DashboardMainSection>
    );
  }
}


function mapStateToProps(state) {
  const peopleResults = state.getIn(['search', 'searchResults'], Immutable.List());
  const isFetchingPeople = state.getIn(['search', 'isLoadingPeople'], false);
  return {
    peopleResults,
    isFetchingPeople
  };
}

function mapDispatchToProps(dispatch) {

  return {
    actions: bindActionCreators({ getPeople, searchPeopleRequest }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PeopleContainer);
