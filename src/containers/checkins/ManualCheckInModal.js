/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import type { RequestState } from 'redux-reqseq';
import { DateTime } from 'luxon';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/pro-light-svg-icons';

import ManualCheckInForm from '../../components/checkins/ManualCheckInForm';
import { OL } from '../../utils/consts/Colors';
import { IconContainer } from '../../components/checkins/CheckInsStyledTags';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { CHECKINS_ACTIONS } from '../../utils/consts/redux/CheckInConsts';
import {
  getError,
  getReqState,
  requestIsPending,
  requestIsStandby,
  requestIsSuccess
} from '../../utils/consts/redux/ReduxUtils';

import { createManualCheckIn, resetCheckInAction } from './CheckInActions';

const StyledIconContainer = styled(IconContainer)`
  color: ${OL.GREEN02};
  min-width: 575px;
  min-height: 432px;
  font-size: 20px;
`;

type Props = {
  createManualCheckInError :Error,
  closeManualCheckInModal :() => void,
  createManualCheckInReqState :RequestState,
  open :boolean,
  personName :string,
  personEKID :string,
  actions :{
    createManualCheckIn :(
      dateTime :DateTime,
      contactMethod :string,
      personEKID :string,
      notes :string
    ) => void;
  }
};

const INITIAL_STATE = {
  notes: '',
  contactMethod: null,
  dateTime: DateTime.local()
};

class ManualCheckInModal extends React.Component<Props, *> {
  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  componentDidUpdate(prevProps) {
    const { createManualCheckInReqState } = this.props;
    const createWasSuccess :boolean = requestIsSuccess(prevProps.createManualCheckInReqState);
    const createIsStandby :boolean = requestIsStandby(createManualCheckInReqState);
    if (createWasSuccess && createIsStandby) {
      this.setState(INITIAL_STATE);
    }
  }

  onClose = () => {
    const { closeManualCheckInModal } = this.props;
    closeManualCheckInModal();
  }

  submitManualCheckIn = () => {
    const { actions, personEKID } = this.props;
    const { notes, contactMethod, dateTime } = this.state;
    actions.createManualCheckIn({
      dateTime,
      contactMethod,
      personEKID,
      notes
    });
  }

  setDateTime = dateTime => this.setState({ dateTime: DateTime.fromISO(dateTime) });

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  render() {
    const { contactMethod, dateTime, notes } = this.state;
    const {
      createManualCheckInError,
      createManualCheckInReqState,
      open,
      personEKID,
      personName
    } = this.props;
    const createIsPending :boolean = requestIsPending(createManualCheckInReqState);
    const createIsSuccess :boolean = requestIsSuccess(createManualCheckInReqState);
    let onClickPrimary = this.submitManualCheckIn;
    let textPrimary = 'Save';
    let onClickSecondary = this.onClose;
    let textSecondary = 'Discard';
    if (createIsSuccess) {
      onClickPrimary = this.onClose;
      textPrimary = 'Ok';
      onClickSecondary = undefined;
      textSecondary = undefined;
    }
    return (
      <Modal
          onClose={this.onClose}
          isVisible={open}
          onClickPrimary={onClickPrimary}
          onClickSecondary={onClickSecondary}
          shouldBeCentered
          shouldStretchButtons
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          textTitle={`Check-In: ${personName}`}>
        {
          createIsSuccess
            ? (
              <StyledIconContainer>
                <FontAwesomeIcon size="5x" icon={faCheckCircle} />
                Success
              </StyledIconContainer>
            )
            : (
              <ManualCheckInForm
                  contactMethod={contactMethod}
                  error={createManualCheckInError.message || ''}
                  dateTime={dateTime.toISO()}
                  handleInputChange={this.handleInputChange}
                  loading={createIsPending}
                  personEKID={personEKID}
                  notes={notes}
                  setDateTime={this.setDateTime} />
            )
        }
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const checkIns = state.get(STATE.CHECK_INS);
  return {
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    createManualCheckInError: getError(checkIns, CHECKINS_ACTIONS.CREATE_MANUAL_CHECK_IN),
    createManualCheckInReqState: getReqState(checkIns, CHECKINS_ACTIONS.CREATE_MANUAL_CHECK_IN)
  };
}


const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Checkin Actions
    createManualCheckIn,
    resetCheckInAction
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(ManualCheckInModal);
