/*
 * @flow
 */
import React from 'react';
import { List, Map, Set } from 'immutable';
import { Table } from 'lattice-ui-kit';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import type { Dispatch } from 'redux';

import JudgesRow from '../../components/judges/JudgesRow';
import { formatPeopleInfo } from '../../utils/PeopleUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';
import {
  ASSOCIATE_JUDGE_WITH_COUNTY,
  LOAD_JUDGES,
  REMOVE_JUDGE_FROM_COUNTY,
  associateJudgeToCounty,
  removeJudgeFromCounty
} from './JudgeActions';

// Redux State Imports
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { COUNTIES_DATA } from '../../utils/consts/redux/CountiesConsts';
import JUDGES_DATA from '../../utils/consts/redux/JudgeConsts';

const { GENERAL_ID } = PROPERTY_TYPES;
const { PREFERRED_COUNTY } = SETTINGS;

const HEADERS :Object[] = [
  { key: 'lastFirstMidString', label: 'Judge Name' },
  { key: 'includedInCountyList', label: 'Add/Remove', cellStyle: { width: '200px' } }
];

type Props = {
  actions :{
    associateJudgeToCounty :RequestSequence;
    removeJudgeFromCounty :RequestSequence;
  };
  associateJudgeRS :RequestState;
  countiesById :Map;
  judgeOptions :List;
  judgesUpdating :Set;
  loadingJudgeRS :RequestState;
  preferredCountyEKID :UUID;
  removeJudgeRS :RequestState;
};

const rowsPerPageOptions = [10, 20, 30];

const BulkHearingsEditForm = (props :Props) => {
  const {
    actions,
    associateJudgeRS,
    countiesById,
    judgeOptions,
    judgesUpdating,
    loadingJudgeRS,
    preferredCountyEKID,
    removeJudgeRS
  } = props;

  const loadingJudges = requestIsPending(loadingJudgeRS);
  const updating = requestIsPending(associateJudgeRS) || requestIsPending(removeJudgeRS);

  const handleUpdate = (judge :Object) => {
    const {
      judgeEKID,
      countyEKID,
      includedInCountyList
    } = judge;
    const addingToCounty = !includedInCountyList;
    if (addingToCounty) {
      const county = countiesById.get(preferredCountyEKID, Map());
      const { [GENERAL_ID]: countyNumber } = getEntityProperties(county, [GENERAL_ID]);
      actions.associateJudgeToCounty({ countyEKID, countyNumber, judgeEKID });
    }
    else {
      actions.removeJudgeFromCounty({ countyEKID, judgeEKID });
    }
  };

  const components :Object = {
    Row: ({ data } :any) => {
      const { judgeEKID } = data;
      const isLoading = updating && judgesUpdating.includes(judgeEKID);
      return (
        <JudgesRow data={data} handleUpdate={handleUpdate} isLoading={isLoading} />
      );
    }
  };

  return (
    <Table
        components={components}
        data={judgeOptions}
        headers={HEADERS}
        isLoading={loadingJudges}
        paginated
        rowsPerPageOptions={rowsPerPageOptions} />
  );
};

const mapStateToProps = (state :Map) => {
  const app = state.get(STATE.APP);
  const counties = state.get(STATE.COUNTIES);
  const judges = state.get(STATE.JUDGES);
  const preferredCountyEKID = app.getIn([APP_DATA.SELECTED_ORG_SETTINGS, PREFERRED_COUNTY], '');

  const judgesByCounty = judges.get(JUDGES_DATA.JUDGES_BY_COUNTY, Map());
  const judgesById = judges.get(JUDGES_DATA.JUDGES_BY_ID, Map());
  const judgesUpdating = judges.get(JUDGES_DATA.JUDGES_UPDATING, Set());
  const countiesById = counties.get(COUNTIES_DATA.COUNTIES_BY_ID, Map());

  const judgeOptions = judgesById.valueSeq().map((judge) => {
    const { lastFirstMidString, personEntityKeyId: judgeEKID } = formatPeopleInfo(judge);
    const includedInCountyList = judgesByCounty.get(preferredCountyEKID, Set()).includes(judgeEKID);
    return {
      id: judgeEKID,
      lastFirstMidString,
      judgeEKID,
      countyEKID: preferredCountyEKID,
      includedInCountyList
    };
  }).toJS();

  return {
    associateJudgeRS: getReqState(judges, ASSOCIATE_JUDGE_WITH_COUNTY),
    countiesById,
    judgeOptions,
    judgesUpdating,
    loadingJudgeRS: getReqState(judges, LOAD_JUDGES),
    preferredCountyEKID,
    removeJudgeRS: getReqState(judges, REMOVE_JUDGE_FROM_COUNTY)
  };
};

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    associateJudgeToCounty,
    removeJudgeFromCounty
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(BulkHearingsEditForm);
