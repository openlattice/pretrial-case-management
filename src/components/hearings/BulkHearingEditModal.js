// @flow
import React, { useEffect } from 'react';
import { Map, Set } from 'immutable';
import { connect } from 'react-redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import { Modal } from 'lattice-ui-kit';

import BulkHearingsEditForm from '../../containers/hearings/BulkHearingsEditForm';
import { UPDATE_BULK_HEARINGS } from '../../containers/hearings/HearingsActions';

// Redux State Imports
import { getReqState, requestIsSuccess } from '../../utils/consts/redux/ReduxUtils';
import { STATE } from '../../utils/consts/redux/SharedConsts';

type Props = {
  actions :{
    updateBulkHearings :RequestSequence;
  };
  associationEKIDs :Set;
  defaultCourtroom :string;
  defaultDateTime :string;
  hearingEKIDs :Set;
  updateBulkHearingsRS :RequestState;
  isVisible :boolean;
  onClose :() => void;
};

const BulkHearingsEditModal = (props :Props) => {
  const {
    associationEKIDs,
    defaultCourtroom,
    defaultDateTime,
    hearingEKIDs,
    isVisible,
    onClose,
    updateBulkHearingsRS,
  } = props;
  const updateSuccessful = requestIsSuccess(updateBulkHearingsRS);

  useEffect(() => {
    if (updateSuccessful) {
      onClose();
    }
  }, [onClose, updateSuccessful]);

  return (
    <Modal
        isVisible={isVisible}
        onClose={onClose}
        textTitle="Bulk Hearing Update"
        viewportScrolling>
      <BulkHearingsEditForm
          associationEKIDs={associationEKIDs}
          defaultCourtroom={defaultCourtroom}
          defaultDateTime={defaultDateTime}
          hearingEKIDs={hearingEKIDs} />
    </Modal>
  );
};

const mapStateToProps = (state :Map) => {
  const hearings = state.get(STATE.HEARINGS);
  return {
    updateBulkHearingsRS: getReqState(hearings, UPDATE_BULK_HEARINGS)
  };
};

// $FlowFixMe
export default connect(mapStateToProps, null)(BulkHearingsEditModal);
