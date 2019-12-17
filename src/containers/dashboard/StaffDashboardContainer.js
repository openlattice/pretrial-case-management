/*
 * @flow
 */

import React from 'react';
import { Map } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import { REVIEW } from '../../utils/consts/FrontEndStateConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

import * as ReviewActions from '../review/ReviewActions';

type Props = {
  selectedOrganizationId :string,
  actions :{
    downloadPSAReviewPDF :(values :{
      neighbors :Map<*, *>,
      scores :Map<*, *>
    }) => void,
    checkPSAPermissions :() => void,
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

  render() {


    return (
      <DashboardMainSection />
    );
  }
}

function mapStateToProps(state, ownProps) {
  const { personId } = ownProps.match.params;
  const app = state.get(STATE.APP);
  const review = state.get(STATE.REVIEW);

  return {
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    personId,
    [REVIEW.PSA_NEIGHBORS_BY_ID]: review.get(REVIEW.PSA_NEIGHBORS_BY_ID),
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

  Object.keys(ReviewActions).forEach((action :string) => {
    actions[action] = ReviewActions[action];
  });

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StaffDashboard);
