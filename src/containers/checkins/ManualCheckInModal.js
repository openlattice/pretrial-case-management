/*
 * @flow
 */

import React from 'react';
import type { RequestState } from 'redux-reqseq';
import { DateTime } from 'luxon';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ManualCheckInForm from '../../components/checkins/ManualCheckInForm';
import { getReqState, requestIsPending, requestIsSuccess } from '../../utils/consts/redux/ReduxUtils';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { CHECKINS_ACTIONS } from '../../utils/consts/redux/CheckInConsts';

import { createManualCheckIn } from './CheckInActions';

type Props = {
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
    const { createManualCheckInReqState: prevCreateReqState } = prevProps;
    const { createManualCheckInReqState } = this.props;
    const createWasPending :boolean = requestIsPending(prevCreateReqState);
    const createIsSuccess :boolean = requestIsSuccess(createManualCheckInReqState);
    if (createWasPending && createIsSuccess) {
      this.onClose();
    }
  }

  onClose = () => {
    const { closeManualCheckInModal } = this.props;
    closeManualCheckInModal();
    this.setState(INITIAL_STATE);
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
    const { open, personName, personEKID } = this.props;
    const { notes, contactMethod, dateTime } = this.state;
    return (
      <Modal
          onClose={this.onClose}
          isVisible={open}
          onClickPrimary={this.submitManualCheckIn}
          onClickSecondary={this.onClose}
          shouldBeCentered
          shouldStretchButtons
          textPrimary="Save"
          textSecondary="Discard"
          textTitle={`Check-In: ${personName}`}>
        <ManualCheckInForm
            contactMethod={contactMethod}
            dateTime={dateTime.toISO()}
            personEKID={personEKID}
            handleInputChange={this.handleInputChange}
            notes={notes}
            setDateTime={this.setDateTime} />
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

    createManualCheckInReqState: getReqState(checkIns, CHECKINS_ACTIONS.CREATE_MANUAL_CHECK_IN)
  };
}


const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Checkin Actions
    createManualCheckIn,
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(ManualCheckInModal);
