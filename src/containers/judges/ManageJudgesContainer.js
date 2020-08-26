/*
 * @flow
 */
import React from 'react';
import { Map } from 'immutable';
import { Banner, Card, CardSegment } from 'lattice-ui-kit';
import { connect } from 'react-redux';

import ManageJudgesTable from './ManageJudgesTable';
import {
  ASSOCIATE_JUDGE_TO_COUNTY,
  LOAD_JUDGES,
  REMOVE_JUDGE_FROM_COUNTY
} from './JudgeActions';

// Redux State Imports
import { getError, requestIsFailure } from '../../utils/consts/redux/ReduxUtils';
import { STATE } from '../../utils/consts/redux/SharedConsts';

type Props = {
  associateJudgeError :Map;
  loadJudgesError :Map;
  removeJudgeError :Map;
};

const BulkHearingsEditForm = (props :Props) => {
  const {
    associateJudgeError,
    loadJudgesError,
    removeJudgeError
  } = props;

  let failureText = '';
  if (requestIsFailure(associateJudgeError)) failureText = 'Failed to add judge to county';
  if (requestIsFailure(loadJudgesError)) failureText = 'Failed to load judges';
  if (requestIsFailure(removeJudgeError)) failureText = 'Failed to remove judge from county';

  return (
    <Card>
      <CardSegment>
        <Banner mode="danger" isOpen={failureText.length}>{ failureText }</Banner>
        <h3>Manage Judges</h3>
      </CardSegment>
      <CardSegment>
        <ManageJudgesTable />
      </CardSegment>
    </Card>
  );
};

const mapStateToProps = (state :Map) => {
  const judges = state.get(STATE.JUDGES);
  return {
    loadJudgesError: getError(judges, LOAD_JUDGES),
    associateJudgeError: getError(judges, ASSOCIATE_JUDGE_TO_COUNTY),
    removeJudgeError: getError(judges, REMOVE_JUDGE_FROM_COUNTY),
  };
};

// $FlowFixMe
export default connect(mapStateToProps, null)(BulkHearingsEditForm);
