/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import RemindersContainer from '../reminders/RemindersContainer';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import VisualizeContainer from './VisualizeContainer';
import NavButtonToolbar from '../../components/buttons/NavButtonToolbar';
import {
  SETTINGS,
  MODULE
} from '../../utils/consts/DataModelConsts';
import {
  APP,
  STATE,
  PEOPLE,
  REVIEW,
} from '../../utils/consts/FrontEndStateConsts';

import * as Routes from '../../core/router/Routes';
import * as ReviewActionFactory from '../review/ReviewActionFactory';

const ToolbarWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`;

type Props = {
  selectedOrganizationId :string,
  selectedOrganizationSettings :Map<*, *>,
  actions :{
    getPersonData :(personId :string) => void,
    getPersonNeighbors :(value :{
      personId :string
    }) => void,
    loadCaseHistory :(values :{
      personId :string,
      neighbors :Map<*, *>
    }) => void,
    downloadPSAReviewPDF :(values :{
      neighbors :Map<*, *>,
      scores :Map<*, *>
    }) => void,
    loadPSAData :(psaIds :string[]) => void,
    loadCaseHistory :(values :{
      personId :string,
      neighbors :Immutable.Map<*, *>
    }) => void,
    loadHearingNeighbors :(hearingIds :string[]) => void,
    loadJudges :() => void,
    checkPSAPermissions :() => void,
    refreshPSANeighbors :({ id :string }) => void,
    submit :(value :{ config :Object, values :Object}) => void,
    replaceEntity :(value :{ entitySetName :string, entityKeyId :string, values :Object }) => void,
    deleteEntity :(value :{ entitySetName :string, entityKeyId :string }) => void,
    clearSubmit :() => void,

  },
  match :{
    params :{
      personId :string
    }
  }
};

class StaffDashboard extends React.Component<Props, State> {

  componentDidMount() {
    const { actions, selectedOrganizationId } = this.props;
    if (selectedOrganizationId) {
      actions.checkPSAPermissions();
    }
  }

  renderRemindersPortal = () => <RemindersContainer />;

  renderVisualizationPortal = () => <VisualizeContainer />;

  render() {
    const { selectedOrganizationSettings } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    const courtRemindersEnabled = selectedOrganizationSettings.get(SETTINGS.COURT_REMINDERS, false);
    const remindersRoute = `${Routes.STAFF_DASHBOARD}/${Routes.REMINDERS}`;
    const visualizeRoute = `${Routes.STAFF_DASHBOARD}/${Routes.VISUALIZE}`;

    const navButtons = [
      {
        path: visualizeRoute,
        label: 'Visualize'
      }
    ];

    const remindersButton = {
      path: remindersRoute,
      label: 'Court Reminders'
    };

    if (courtRemindersEnabled) navButtons.push(remindersButton);

    return (
      <DashboardMainSection>
        <ToolbarWrapper>
          <NavButtonToolbar options={navButtons} />
        </ToolbarWrapper>
        <Switch>
          <Route path={visualizeRoute} render={this.renderVisualizationPortal} />
          <Route path={remindersRoute} render={this.renderRemindersPortal} />
          <Redirect from={Routes.STAFF_DASHBOARD} to={visualizeRoute} />
        </Switch>
      </DashboardMainSection>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const { personId } = ownProps.match.params;
  const app = state.get(STATE.APP);
  const review = state.get(STATE.REVIEW);
  const people = state.get(STATE.PEOPLE);

  return {
    [APP.SELECTED_ORG_ID]: app.get(APP.SELECTED_ORG_ID),
    [APP.SELECTED_ORG_SETTINGS]: app.get(APP.SELECTED_ORG_SETTINGS),

    personId,
    [REVIEW.ENTITY_SET_ID]: review.get(REVIEW.ENTITY_SET_ID) || people.get(PEOPLE.SCORES_ENTITY_SET_ID),
    [REVIEW.NEIGHBORS_BY_ID]: review.get(REVIEW.NEIGHBORS_BY_ID),
    [REVIEW.LOADING_DATA]: review.get(REVIEW.LOADING_DATA),
    [REVIEW.LOADING_RESULTS]: review.get(REVIEW.LOADING_RESULTS),
    [REVIEW.HEARINGS]: review.get(REVIEW.HEARINGS),
    [REVIEW.LOADING_DATA]: review.get(REVIEW.LOADING_DATA),
    [REVIEW.PSA_IDS_REFRESHING]: review.get(REVIEW.PSA_IDS_REFRESHING),
    readOnlyPermissions: review.get(REVIEW.READ_ONLY),
  };
}

function mapDispatchToProps(dispatch) {
  const actions :{ [string] :Function } = {};

  Object.keys(ReviewActionFactory).forEach((action :string) => {
    actions[action] = ReviewActionFactory[action];
  });

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StaffDashboard);
