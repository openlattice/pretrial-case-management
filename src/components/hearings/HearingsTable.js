/*
 * @flow
 */
import React from 'react';
import { DateTime } from 'luxon';
import type { RequestState } from 'redux-reqseq';
import { Table } from 'lattice-ui-kit';
import { List, Map } from 'immutable';

import ConfirmationModal from '../ConfirmationModal';
import HearingRow from './HearingRow';
import { CONFIRMATION_ACTION_TYPES, CONFIRMATION_OBJECT_TYPES } from '../../utils/consts/Consts';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getEntityProperties, isUUID } from '../../utils/DataUtils';

import { requestIsPending, requestIsSuccess } from '../../utils/consts/redux/ReduxUtils';

const {
  CASE_ID,
  COURTROOM,
  DATE_TIME,
  ENTITY_KEY_ID,
  HEARING_TYPE
} = PROPERTY_TYPES;

type Props = {
  cancelFn :(values :{ entityKeyId :string }) => void;
  hearingsWithOutcomes :List;
  hearings :Map;
  updateHearingReqState :RequestState;
}

export const HEADERS = [
  { key: 'dateTime', label: 'Date' },
  { key: 'courtroom', label: 'Courtroom' },
  { key: 'type', label: 'Type' },
  { key: 'caseId', label: 'Case ID' },
  { key: 'cancelButton', label: '' },
];

const getHearingData = (hearing :Map, hearingsWithOutcomes :List) => {
  const {
    [CASE_ID]: caseId,
    [DATE_TIME]: date,
    [ENTITY_KEY_ID]: id,
    [COURTROOM]: courtroom,
    [HEARING_TYPE]: type
  } = getEntityProperties(hearing, [
    CASE_ID,
    DATE_TIME,
    ENTITY_KEY_ID,
    COURTROOM,
    HEARING_TYPE
  ]);
  const dateTime = DateTime.fromISO(date).toLocaleString({
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
  const hearingHasOutcome = hearingsWithOutcomes.includes(id);
  const hearingWasCreatedManually = isUUID(caseId);
  const disabled = hearingHasOutcome || !hearingWasCreatedManually;

  return {
    caseId,
    courtroom,
    dateTime,
    disabled,
    hearing,
    id,
    type
  };
};

const pageOptions = [10, 20, 30, 50];

class HearingsTable extends React.Component<Props, *> {
  constructor(props :Props) {
    super(props);
    this.state = {
      confirmationModalOpen: false,
      hearing: Map()
    };
  }

  componentDidUpdate(prevProps :Props) {
    const { updateHearingReqState } = this.props;
    const wasPending = requestIsPending(prevProps.updateHearingReqState);
    const isSuccess = requestIsSuccess(updateHearingReqState);
    if (wasPending && isSuccess) {
      this.closeConfirmationModal();
    }
  }

  openConfirmationModal = (hearing :Map) => this.setState({
    confirmationModalOpen: true,
    hearing
  });

  closeConfirmationModal = () => this.setState({
    confirmationModalOpen: false,
    hearing: Map()
  });

  render() {
    const {
      hearings,
      cancelFn,
      hearingsWithOutcomes,
      updateHearingReqState
    } = this.props;
    const hearingCancellationIsPending = requestIsPending(updateHearingReqState);
    const { confirmationModalOpen, hearing } = this.state;
    const components :Object = {
      Row: ({ data } :Object) => (
        <HearingRow cancelFn={cancelFn} data={data} openConfirmationModal={this.openConfirmationModal} />
      )
    };
    const hearingData = hearings.map((hearingObj) => getHearingData(hearingObj, hearingsWithOutcomes));

    return (
      <>
        <Table
            components={components}
            data={hearingData}
            headers={HEADERS}
            paginated
            rowsPerPageOptions={pageOptions} />
        <ConfirmationModal
            disabled={hearingCancellationIsPending}
            confirmationType={CONFIRMATION_ACTION_TYPES.CANCEL}
            objectType={CONFIRMATION_OBJECT_TYPES.HEARING}
            onClose={this.closeConfirmationModal}
            open={confirmationModalOpen}
            confirmationAction={() => cancelFn(hearing)} />
      </>
    );
  }
}

export default HearingsTable;
