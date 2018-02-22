/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import { getPeople } from './PeopleActionFactory';
import * as Routes from '../../core/router/Routes';
import { PERSON_FQNS } from '../../utils/consts/Consts';
import { StyledInnerNav } from '../../utils/Layout';
import InnerNavLink from '../../components/InnerNavLink';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import PeopleList from '../../components/people/PeopleList';
import { formatDOB } from '../../utils/Helpers';

type Props = {
  isFetchingPeople :boolean,
  peopleResults :Immutable.List<*>,
  actions :{
    getPeople :() => void
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
    const formattedDOB = formatDOB(person.getIn([PERSON_FQNS.DOB, 0]));
    return {
      identification: person.getIn([PERSON_FQNS.SUBJECT_ID, 0]),
      firstName: person.getIn([PERSON_FQNS.FIRST_NAME, 0]),
      lastName: person.getIn([PERSON_FQNS.LAST_NAME, 0]),
      dob: formattedDOB,
      photo: person.getIn([PERSON_FQNS.PHOTO, 0])
    };
  }

  getFormattedPeople = () => {
    const formattedPeople = this.props.peopleResults.map(person => this.formatPeopleInfo(person));

    return formattedPeople;
  }

  renderCurrentPeopleComponent = () => {
    const formattedPeople = this.getFormattedPeople();
    return (
      <PeopleList
          people={formattedPeople}
          isFetchingPeople={this.props.isFetchingPeople}
          didMapPeopleToProps={this.state.didMapPeopleToProps} />
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
          <InnerNavLink
              path={Routes.INCOMING_PEOPLE}
              name={Routes.INCOMING_PEOPLE}
              label="Incoming" />
          <InnerNavLink
              path={Routes.PAST_PEOPLE}
              name={Routes.PAST_PEOPLE}
              label="Past" />
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
  const people = state.getIn(['people', 'peopleResults'], Immutable.List());
  const isFetchingPeople = state.getIn(['people', 'isFetchingPeople'], false);
  return {
    peopleResults: people,
    isFetchingPeople
  };
}

function mapDispatchToProps(dispatch) {

  return {
    actions: bindActionCreators({ getPeople }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PeopleContainer);
