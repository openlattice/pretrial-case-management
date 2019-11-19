
/*
 * @flow
 */
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import type { RequestSequence } from 'redux-reqseq';

import BasicButton from '../../components/buttons/BasicButton';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';

import * as FormActionFactory from '../psa/FormActionFactory';
import * as ReviewActionFactory from '../review/ReviewActionFactory';
import * as PersonActions from './PersonActions';

import { PSA_FORM, PSA_MODAL } from '../../utils/consts/FrontEndStateConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { PERSON_ACTIONS, PERSON_DATA } from '../../utils/consts/redux/PersonConsts';

type Props = {
  selectedOrganizationSettings :Map<*, *>,
  updateCasesReqState :RequestState,
  loadPersonDetailsReqState :RequestState,
  isLoadingNeighbors :boolean,
  personEntityKeyId :string,
  actions :{
    loadApp :RequestSequence;
    loadCharges :RequestSequence;
    logout :() => void;
  };
};

// This button's function is to update a subjects casehistory on the fly from bifrost.

class LoadPersonCaseHistoryButton extends React.Component<Props, State> {

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
      updateCasesReqState,
      loadPersonDetailsReqState,
      isLoadingNeighbors
    } = this.props;
    const isLoadingCases = requestIsPending(updateCasesReqState);
    const loadingPersonDetails = requestIsPending(loadPersonDetailsReqState);
    const loading = isLoadingCases
      || isLoadingNeighbors
      || loadingPersonDetails;
    return this.shouldLoadCases()
      ? <BasicButton onClick={this.loadCaseHistory} disabled={loading}>Load Case History</BasicButton>
      : null;
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const psaModal = state.get(STATE.PSA_MODAL);
  const psaForm = state.get(STATE.PSA);
  const person = state.get(STATE.PERSON);

  return {
    // App
    [APP_DATA.ORGS]: app.get(APP_DATA.ORGS),
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    // People
    [PSA_MODAL.LOADING_CASES]: psaModal.get(PSA_MODAL.LOADING_CASES),

    // PSA Form
    [PSA_FORM.LOADING_NEIGHBORS]: psaForm.get(PSA_FORM.LOADING_NEIGHBORS),

    // Person
    loadPersonDetailsReqState: getReqState(person, PERSON_ACTIONS.LOAD_PERSON_DETAILS),
    [PERSON_DATA.SELECTED_PERSON_ID]: person.get(PERSON_DATA.SELECTED_PERSON_ID),
    [PERSON_DATA.LOADING_PERSON_DETAILS]: person.get(PERSON_DATA.LOADING_PERSON_DETAILS),
    updateCasesReqState: getReqState(person, PERSON_ACTIONS.UPDATE_CASES),
    [PERSON_DATA.NUM_CASES_TO_LOAD]: person.get(PERSON_DATA.NUM_CASES_TO_LOAD),
    [PERSON_DATA.NUM_CASES_LOADED]: person.get(PERSON_DATA.NUM_CASES_LOADED),
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(FormActionFactory).forEach((action :string) => {
    actions[action] = FormActionFactory[action];
  });

  Object.keys(ReviewActionFactory).forEach((action :string) => {
    actions[action] = ReviewActionFactory[action];
  });

  Object.keys(PersonActions).forEach((action :string) => {
    actions[action] = PersonActions[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoadPersonCaseHistoryButton);
