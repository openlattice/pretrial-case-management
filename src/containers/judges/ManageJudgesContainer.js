/*
 * @flow
 */
import React from 'react';
import { Map } from 'immutable';
import { Banner, Card, CardSegment } from 'lattice-ui-kit';
import { connect } from 'react-redux';

import ManageJudgesTable from './ManageJudgesTable';
import { InstructionalText, InstructionalSubText } from '../../components/TextStyledComponents';
import {
  ASSOCIATE_JUDGE_WITH_COUNTY,
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
        <InstructionalText>Manage Judges</InstructionalText>
        <InstructionalSubText>
          {

            "This list shows all judges for your state. The 'plus' and 'minus' icons denote"
            + ' weather or not the judge presides over your county. These icons can also be used'
            + ' to add and remove judges from your county.'
          }
        </InstructionalSubText>
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
    associateJudgeError: getError(judges, ASSOCIATE_JUDGE_WITH_COUNTY),
    removeJudgeError: getError(judges, REMOVE_JUDGE_FROM_COUNTY),
  };
};

// $FlowFixMe
export default connect(mapStateToProps, null)(BulkHearingsEditForm);
