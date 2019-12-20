/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { RequestState } from 'redux-reqseq';
import type { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { List, Map } from 'immutable';
import {
  Button,
  Card,
  CardHeader,
  CardSegment
} from 'lattice-ui-kit';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/pro-light-svg-icons';

import { OL } from '../../utils/consts/Colors';
import { StyledFormWrapper } from '../../utils/Layout';
import LoadPersonCaseHistoryButton from './LoadPersonCaseHistoryButton';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { getReqState, getError, requestIsFailure } from '../../utils/consts/redux/ReduxUtils';
import { FAILED_CASES, PERSON_ACTIONS } from '../../utils/consts/redux/PersonConsts';

import * as Routes from '../../core/router/Routes';
import { goToPath } from '../../core/router/RoutingActionFactory';
import { clearForm } from '../psa/PSAFormActions';
import { resetPersonAction } from './PersonActions';

const StyledCardHeader = styled(CardHeader)`
  svg {
    margin: 0 3px;
  }
`;

const StyledCardSegment = styled(CardSegment)`
  button {
    margin-right: 10px;
  }
`;

type Props = {
  actions :{
    goToPath :(path :string) => void,
    clearForm :() => void,
  },
  personEKID :string,
  updateCasesReqState :RequestState,
  updateCasesError :Map<*, *>
};

class CaseLoaderError extends React.Component<Props, *> {

  restart = () => {
    const { actions } = this.props;
    actions.goToPath(`${Routes.PSA_FORM}/1`);
    actions.clearForm();
    actions.resetPersonAction({ actionType: PERSON_ACTIONS.UPDATE_CASES });
  }

  ignore = () => {
    const { actions } = this.props;
    actions.resetPersonAction({ actionType: PERSON_ACTIONS.UPDATE_CASES });
  }

  renderCaseLoaderButton = () => {
    const { personEKID } = this.props;
    return <LoadPersonCaseHistoryButton buttonText="Try Again" personEntityKeyId={personEKID} />;
  };

  renderIgnoreButton = () => <Button onClick={this.ignore}>Ignore</Button>;

  renderRestartButton = () => <Button onClick={this.restart}>Discard</Button>;

  render() {
    const { updateCasesReqState, updateCasesError } = this.props;
    const updateCasesFailed = requestIsFailure(updateCasesReqState);
    if (updateCasesFailed) {
      const failedCases = updateCasesError.get(FAILED_CASES, List());
      const statusText = `An Error occured while loading the following cases: ${failedCases.join(', ')}.
      If these failed cases previously existed in OpenLattice and qualify for autofill justification on the
      PSA form, they have been inserted into the notes of the relevant question. Click the 'Try Again' button
      below to attempt to load the case history again. If you would like to restart this PSA, you can click
      the 'Discard' button below. If this problem continues, please contact OpenLattice support.\n
      You may also click the 'Ignore' button and submit the PSA as you see it below.`;
      return (
        <StyledFormWrapper>
          <Card>
            <StyledCardHeader mode="danger">
              <FontAwesomeIcon color={OL.WHITE} icon={faExclamationTriangle} />
              Case Loader Error Detected
            </StyledCardHeader>
            <CardSegment>
              { statusText }
            </CardSegment>
            <StyledCardSegment>
              { this.renderCaseLoaderButton() }
              { this.renderRestartButton() }
              { this.renderIgnoreButton() }
            </StyledCardSegment>
          </Card>
        </StyledFormWrapper>
      );
    }
    return null;
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const person = state.get(STATE.PERSON);
  return {
    // Person
    updateCasesReqState: getReqState(person, PERSON_ACTIONS.UPDATE_CASES),
    updateCasesError: getError(person, PERSON_ACTIONS.UPDATE_CASES),
  };
}


const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Routing Actions
    goToPath,
    // Form Actions
    clearForm,
    // Person Actions
    resetPersonAction
  }, dispatch)
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CaseLoaderError));
