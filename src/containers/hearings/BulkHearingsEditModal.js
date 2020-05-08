// @flow
import React, { useEffect, useCallback, useState } from 'react';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { List, Map, Set } from 'immutable';
import {
  Banner,
  Button,
  DateTimePicker,
  Input,
  Modal,
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
  requestIsPending,
  requestIsSuccess
} from '../../utils/consts/redux/ReduxUtils';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';

const { PREFERRED_COUNTY } = SETTINGS;

const {
  COURTROOM,
  DATE_TIME,
  HEARING_COMMENTS
} = PROPERTY_TYPES;

const FormWrapper = styled.div`
  padding: 30px;
  display: grid;
  grid-template-columns: repeat(4, auto);
  grid-gap: 10px;
  border-bottom: 1px solid ${OL.GREY11};
`;

const FormHeader = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${OL.GREY15};
  width: 100%;
  display: flex;
  flex-direction: row;
  padding-bottom: 20px;
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
  isVisible :boolean;
  onClose :() => void;
};

const BulkHearingUpdateModal = (props :Props) => {
  const {
    actions,
    associationEKIDs,
    defaultCourtroom,
    defaultDateTime,
    hearingEKIDs,
    isVisible,
    judgeOptions,
    onClose,
    updateBulkHearingsError,
    updateBulkHearingsRS,
  } = props;

  const updating = requestIsPending(updateBulkHearingsRS);
  const updateSuccessful = requestIsSuccess(updateBulkHearingsRS);
  const updateFailed = requestIsFailure(updateBulkHearingsRS);

  const [courtroomOption, setCourtroomOption] = useState({ label: defaultCourtroom, value: defaultCourtroom });
  const [DateTimeOption, setDateTime] = useState(defaultDateTime);
  const [judgeOption, setJudgeOption] = useState({});
  const [otherJudgeString, setOtherJudge] = useState('');

  const handleClose = useCallback(() => {
    onClose();
    setCourtroomOption({});
    setDateTime('');
    setJudgeOption({});
    setOtherJudge('');
  }, [actions, onClose]);

  useEffect(() => {
    if (updateSuccessful) {
      handleClose();
    }
  }, [handleClose, updateBulkHearingsRS]);

  const handleUpdate = () => {
    const judgeEKID :UUID = judgeOption.value;
    const newHearingData = {};
    if (DateTimeOption) newHearingData[DATE_TIME] = DateTimeOption;
    if (courtroomOption.value) newHearingData[COURTROOM] = courtroomOption.value;
    if (otherJudgeString) newHearingData[HEARING_COMMENTS] = newHearingData;
    actions.updateBulkHearings({
      associationEKIDs,
      hearingEKIDs,
      judgeEKID,
      newHearingData
    });
  };

  return (
    <Modal
        isVisible={isVisible}
        onClose={handleClose}
        textTitle="Import Charges">
      <FormWrapper>
        <FormHeader>
          <Banner isOpen={updateFailed} mode="danger">
            {updateBulkHearingsError && 'An error occured while modifying hearings.'}
          </Banner>
        </FormHeader>
        <FormHeader>
          <Banner isOpen={updateSuccessful} mode="success">
            {
              updateSuccessful
                && `Bulk edit was successful.
                Check ${DateTime.fromISO(DateTimeOption).toISODate()}
                ${DateTime.fromISO(DateTimeOption).toISOTime()} for updated hearings. `
            }
          </Banner>
        </FormHeader>
        <FormHeader>
          Bulk Hearing Update
        </FormHeader>
        <div>
          <h3>Date/Time</h3>
          <DateTimePicker value={DateTimeOption} onChange={setDateTime} />
        </div>
        <div>
          <h3>Courtroom</h3>
          <Select
              value={courtroomOption}
              options={COURTROOM_OPTIOINS}
              onChange={setCourtroomOption}
              short />
        </div>
        <div>
          <h3>Judge</h3>
          <Select
              value={judgeOption}
              options={judgeOptions}
              onChange={setJudgeOption}
              short />
        </div>
        <div>
          {
            (judgeOption && judgeOption.value === 'Other')
              && (
                <>
                  <h3>Judge</h3>
                  <Input
                      value={otherJudgeString}
                      onChange={(e) => setOtherJudge(e.target.value)}
                      short />
                </>
              )
          }
        </div>
        <Button
            disabled={!(courtroomOption.value || DateTimeOption)}
            isLoading={updating}
            mode="primary"
            onClick={handleUpdate}>
          {`Update ${hearingEKIDs.size} Hearings`}
        </Button>
      </FormWrapper>
    </Modal>
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
export default connect(mapStateToProps, mapDispatchToProps)(BulkHearingUpdateModal);
