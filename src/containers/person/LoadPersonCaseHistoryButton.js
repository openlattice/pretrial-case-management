
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

import { PSA_MODAL, SEARCH } from '../../utils/consts/FrontEndStateConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

type Props = {
  selectedOrganizationSettings :Map<*, *>,
  psaNeighbors :Map<*, *>,
  caseLoadsComplete :boolean,
  isLoadingCases :boolean,
  loadingPersonDetails :boolean,
  loadingCaseHistory :boolean,
  caseLoadsComplete :boolean,
  personDetailsLoaded :boolean,
  personEntityKeyId :string,
  actions :{
    loadApp :RequestSequence;
    loadCharges :RequestSequence;
    logout :() => void;
  };
};

// This button's function is to update a subjects casehistory on the fly from bifrost.

class LoadPersonCaseHistoryButton extends React.Component<Props, State> {

  componentWillReceiveProps(nextProps) {
    const { actions } = this.props;

    const {
      caseLoadsComplete,
      loadingCaseHistory,
      personDetailsLoaded,
      personEntityKeyId,
      psaNeighbors
    } = nextProps;

    // User has clicked on the Load Case History button, which initiates the integration of
    // the provided subject's (personEntityKeyId) case history on the fly from bifrost.
    // Once this integration is complete, the case history is then reloaded from OpenLattice
    // to reflect the newly integrated data.
    if (caseLoadsComplete && personDetailsLoaded && !loadingCaseHistory) {
      // see loadCastHistory fn in '../review/ReviewSagas'
      actions.loadCaseHistory({ personId: personEntityKeyId, neighbors: psaNeighbors });
    }
    // once loadCaseHistory is fired - Redux state related to case loader (bifrost) is cleared
    // to prevent from gettting stuck in a loop.
    if (loadingCaseHistory) {
      // see clearCaseLoader fn in '../psa/FormSagas'
      actions.clearCaseLoader();
    }
  }

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
      isLoadingCases,
      caseLoadsComplete,
      loadingCaseHistory,
      personDetailsLoaded,
      loadingPersonDetails
    } = this.props;
    const isBetweenLoadingCycles = caseLoadsComplete && personDetailsLoaded && !loadingCaseHistory;
    const loading = isLoadingCases
      || loadingCaseHistory
      || loadingPersonDetails
      || isBetweenLoadingCycles;
    return this.shouldLoadCases
      ? <BasicButton onClick={this.loadCaseHistory} disabled={loading}>Load Case History</BasicButton>
      : null;
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const psaModal = state.get(STATE.PSA_MODAL);
  const search = state.get(STATE.SEARCH);

  return {
    // App
    [APP_DATA.ORGS]: app.get(APP_DATA.ORGS),
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    // People
    [PSA_MODAL.LOADING_CASES]: psaModal.get(PSA_MODAL.LOADING_CASES),

    // Search
    [SEARCH.LOADING_PERSON_DETAILS]: search.get(SEARCH.LOADING_PERSON_DETAILS),
    [SEARCH.PERSON_DETAILS_LOADED]: search.get(SEARCH.PERSON_DETAILS_LOADED),
    [SEARCH.CASE_LOADS_COMPLETE]: search.get(SEARCH.CASE_LOADS_COMPLETE),

    [SEARCH.NUM_CASES_TO_LOAD]: search.get(SEARCH.NUM_CASES_TO_LOAD),
    [SEARCH.NUM_CASES_LOADED]: search.get(SEARCH.NUM_CASES_LOADED),
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
