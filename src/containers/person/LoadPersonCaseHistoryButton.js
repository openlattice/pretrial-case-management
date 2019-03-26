
/*
 * @flow
 */
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import BasicButton from '../../components/buttons/BasicButton';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';

import * as FormActionFactory from '../psa/FormActionFactory';
import * as ReviewActionFactory from '../review/ReviewActionFactory';
import * as PersonActionFactory from './PersonActionFactory';

import {
  APP,
  PSA_MODAL,
  SEARCH,
  STATE
} from '../../utils/consts/FrontEndStateConsts';

type Props = {
  selectedOrganizationSettings :Map<*, *>,
  psaNeighbors :Map<*, *>,
  caseLoadsComplete :boolean,
  isLoadingCases :boolean,
  isLoadingNeighbors :boolean,
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

class ManageChargesContainer extends React.Component<Props, State> {

  componentWillReceiveProps(nextProps) {
    const { actions } = this.props;

    const {
      caseLoadsComplete,
      loadingCaseHistory,
      personDetailsLoaded,
      personEntityKeyId,
      psaNeighbors
    } = nextProps;

    if (caseLoadsComplete && !personDetailsLoaded) {
      actions.loadPersonDetails({
        entityKeyId: personEntityKeyId,
        shouldLoadCases: false
      });
    }
    if (caseLoadsComplete && personDetailsLoaded) {
      actions.loadCaseHistory({ personId: personEntityKeyId, neighbors: psaNeighbors });
    }
    if (loadingCaseHistory) {
      actions.clearCaseLoader();
    }
  }

  shouldLoadCases = () => {
    const { selectedOrganizationSettings } = this.props;
    return selectedOrganizationSettings.get(SETTINGS.LOAD_CASES, false);
  }

  loadCaseHistory = () => {
    const { actions, personEntityKeyId } = this.props;
    actions.loadPersonDetails({
      entityKeyId: personEntityKeyId,
      shouldLoadCases: true
    });
  }

  render() {
    const {
      isLoadingCases,
      loadingCaseHistory,
      loadingPersonDetails
    } = this.props;

    const loading = isLoadingCases || loadingCaseHistory || loadingPersonDetails;
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
    [APP.ORGS]: app.get(APP.ORGS),
    [APP.SELECTED_ORG_ID]: app.get(APP.SELECTED_ORG_ID),
    [APP.SELECTED_ORG_SETTINGS]: app.get(APP.SELECTED_ORG_SETTINGS),

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

  Object.keys(PersonActionFactory).forEach((action :string) => {
    actions[action] = PersonActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageChargesContainer);
