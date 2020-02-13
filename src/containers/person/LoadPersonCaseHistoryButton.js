
/*
 * @flow
 */
import React from 'react';
import type { Dispatch } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button } from 'lattice-ui-kit';

import { SETTINGS } from '../../utils/consts/AppSettingConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { PERSON_ACTIONS, PERSON_DATA } from '../../utils/consts/redux/PersonConsts';
import { PEOPLE_ACTIONS } from '../../utils/consts/redux/PeopleConsts';

import { loadPersonDetails } from './PersonActions';

type Props = {
  actions :{
    loadApp :RequestSequence;
    loadCharges :RequestSequence;
    loadPersonDetails :RequestSequence;
    logout :() => void;
  };
  buttonText :string;
  getPeopleNeighborsReqState :RequestState;
  loadPersonDetailsReqState :RequestState;
  personEntityKeyId :string;
  updateCasesReqState :RequestState;
};

// This button's function is to update a subjects casehistory on the fly from bifrost.

class LoadPersonCaseHistoryButton extends React.Component<Props> {

  shouldLoadCases = () => {
    const { selectedOrganizationSettings } = this.props;
    return selectedOrganizationSettings.get(SETTINGS.LOAD_CASES, false);
  }

  loadCaseHistory = () => {
    const { actions, personEntityKeyId } = this.props;
    // shouldLoadCases is set to true, so that the subjects case history is loaded on the fly from bifrost
    // see loadPersonDetails in '../psa/FormSagas'
    actions.loadPersonDetails({
      entityKeyId: personEntityKeyId,
      shouldLoadCases: true
    });
  }

  render() {
    const {
      buttonText,
      getPeopleNeighborsReqState,
      loadPersonDetailsReqState,
      updateCasesReqState
    } = this.props;
    const isLoadingNeighbors = requestIsPending(getPeopleNeighborsReqState);
    const isLoadingCases = requestIsPending(updateCasesReqState);
    const loadingPersonDetails = requestIsPending(loadPersonDetailsReqState);
    const loading = isLoadingCases
      || isLoadingNeighbors
      || loadingPersonDetails;
    return this.shouldLoadCases()
      ? (
        <Button onClick={this.loadCaseHistory} disabled={loading}>
          { buttonText || 'Load Case History' }
        </Button>
      )
      : null;
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const people = state.get(STATE.PEOPLE);
  const person = state.get(STATE.PERSON);

  return {
    // App
    [APP_DATA.ORGS]: app.get(APP_DATA.ORGS),
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    // People
    getPeopleNeighborsReqState: getReqState(people, PEOPLE_ACTIONS.GET_PEOPLE_NEIGHBORS),

    // Person
    loadPersonDetailsReqState: getReqState(person, PERSON_ACTIONS.LOAD_PERSON_DETAILS),
    [PERSON_DATA.SELECTED_PERSON_ID]: person.get(PERSON_DATA.SELECTED_PERSON_ID),
    updateCasesReqState: getReqState(person, PERSON_ACTIONS.UPDATE_CASES),
    [PERSON_DATA.NUM_CASES_TO_LOAD]: person.get(PERSON_DATA.NUM_CASES_TO_LOAD),
    [PERSON_DATA.NUM_CASES_LOADED]: person.get(PERSON_DATA.NUM_CASES_LOADED),
  };
}


const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Person Actions
    loadPersonDetails
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(LoadPersonCaseHistoryButton);
