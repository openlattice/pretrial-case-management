// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import {
  Banner,
  Button,
  DateTimePicker,
  Input,
  Select
} from 'lattice-ui-kit';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import type { Dispatch } from 'redux';

import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { COURTROOM_OPTIOINS, getJudgeOptions } from '../../utils/HearingUtils';
import { UPDATE_BULK_HEARINGS, updateBulkHearings } from './HearingsActions';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';

// Redux State Imports
import {
  getError,
  getReqState,
  requestIsFailure,
  requestIsPending
} from '../../utils/consts/redux/ReduxUtils';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';

const { PREFERRED_COUNTY } = SETTINGS;

const {
  COURTROOM,
  DATE_TIME,
  ENTITY_KEY_ID,
  HEARING_COMMENTS
} = PROPERTY_TYPES;

const FormWrapper = styled.div`
  min-width: 800px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-column-gap: 10px;
  grid-row-gap: 20px;
  margin-bottom: 30px;
`;

const FullWidthColumn = styled.div`
  color: ${OL.GREY15};
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  grid-column-start: 1;
  grid-column-end: 5;
`;

type Props = {
  actions :{
    updateBulkHearings :RequestSequence;
  };
  associationEKIDs :Set;
  defaultCourtroom :string;
  defaultDateTime :string;
  hearingEKIDs :Set;
  judgeOptions :List;
  updateBulkHearingsError :Map;
  updateBulkHearingsRS :RequestState;
};

const BulkHearingsEditForm = (props :Props) => {
  const {
    actions,
    associationEKIDs,
    defaultCourtroom,
    defaultDateTime,
    hearingEKIDs,
    judgeOptions,
    updateBulkHearingsError,
    updateBulkHearingsRS,
  } = props;

  const updating = requestIsPending(updateBulkHearingsRS);
  const updateFailed = requestIsFailure(updateBulkHearingsRS);

  const [courtroomOption, setCourtroomOption] = useState({ label: defaultCourtroom, value: defaultCourtroom });
  const [dateTimeOption, setDateTime] = useState(defaultDateTime);
  const [judgeOption, setJudgeOption] = useState({});
  const [otherJudgeString, setOtherJudge] = useState('');

  const handleUpdate = () => {
    const judgeEKID :UUID = (
      judgeOption.value && judgeOption.value[ENTITY_KEY_ID] && judgeOption.value[ENTITY_KEY_ID][0]
    ) || '';
    const newHearingData = {};
    if (dateTimeOption && dateTimeOption !== defaultDateTime) newHearingData[DATE_TIME] = dateTimeOption;
    if (courtroomOption.value && courtroomOption.value !== defaultCourtroom) {
      newHearingData[COURTROOM] = courtroomOption.value;
    }
    if (otherJudgeString) {
      newHearingData[DATE_TIME] = dateTimeOption;
      newHearingData[HEARING_COMMENTS] = otherJudgeString;
      newHearingData[COURTROOM] = courtroomOption.value;
    }
    actions.updateBulkHearings({
      associationEKIDs,
      hearingEKIDs,
      judgeEKID,
      newHearingData
    });
  };

  return (
    <FormWrapper>
      <FullWidthColumn>
        <Banner isOpen={updateFailed} mode="danger">
          {updateBulkHearingsError && 'An error occured while modifying hearings.'}
        </Banner>
      </FullWidthColumn>
      <div>
        <h5>Date/Time</h5>
        <DateTimePicker value={dateTimeOption} onChange={setDateTime} />
      </div>
      <div>
        <h5>Courtroom</h5>
        <Select
            value={courtroomOption}
            options={COURTROOM_OPTIOINS}
            onChange={setCourtroomOption}
            short />
      </div>
      <div>
        <h5>Judge</h5>
        <Select
            value={judgeOption}
            options={judgeOptions}
            onChange={setJudgeOption}
            short />
      </div>
      <div>
        {
          (judgeOption && judgeOption.label === 'Other')
            && (
              <>
                <h5>Judge</h5>
                <Input
                    value={otherJudgeString}
                    onChange={(e) => setOtherJudge(e.target.value)}
                    short />
              </>
            )
        }
      </div>
      <FullWidthColumn>
        <Button
            disabled={!(courtroomOption.value || dateTimeOption)}
            color="primary"
            isLoading={updating}
            onClick={handleUpdate}>
          {`Update ${hearingEKIDs.size} Hearings`}
        </Button>
      </FullWidthColumn>
    </FormWrapper>
  );
};

const mapStateToProps = (state :Map) => {
  const app = state.get(STATE.APP);
  const hearings = state.get(STATE.HEARINGS);

  const judgesByCounty = hearings.get(HEARINGS_DATA.JUDGES_BY_COUNTY);
  const judgesById = hearings.get(HEARINGS_DATA.JUDGES_BY_ID);

  const preferredCountyEKID = app.getIn([APP_DATA.SELECTED_ORG_SETTINGS, PREFERRED_COUNTY], '');
  const judgeIdsForCounty = judgesByCounty.get(preferredCountyEKID, Set());

  const judgeOptions = getJudgeOptions(judgeIdsForCounty, judgesById, true);
  return {
    judgeOptions,
    updateBulkHearingsRS: getReqState(hearings, UPDATE_BULK_HEARINGS),
    updateBulkHearingsError: getError(hearings, UPDATE_BULK_HEARINGS)
  };
};

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    updateBulkHearings,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(BulkHearingsEditForm);
