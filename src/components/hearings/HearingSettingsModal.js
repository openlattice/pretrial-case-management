/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import HearingSettingsForm from '../../containers/hearings/HearingSettingsForm';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';

import { closeHearingSettingsModal } from '../../containers/hearings/HearingsActions';

const ModalBody = styled.div`
  box-sizing: border-box;
  height: max-content;
  width: 875px;
`;

type Props = {
  actions :{
    closeHearingSettingsModal :() => void
  };
  hearingSettingsModalOpen :boolean;
}

class HearingSettingsModal extends React.Component<Props> {

  onClose = () => {
    const { actions } = this.props;
    actions.closeHearingSettingsModal();
  }

  render() {
    const { hearingSettingsModalOpen } = this.props;
    return (
      <Modal
          isVisible={hearingSettingsModalOpen}
          onClose={this.onClose}
          shouldCloseOnOutsideClick
          textTitle="Hearing Settings"
          viewportScrolling>
        <ModalBody>
          <HearingSettingsForm />
        </ModalBody>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  const hearings = state.get(STATE.HEARINGS);
  return {
    [HEARINGS_DATA.SETTINGS_MODAL_OPEN]: hearings.get(HEARINGS_DATA.SETTINGS_MODAL_OPEN)
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Hearings Actions
    closeHearingSettingsModal
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(HearingSettingsModal);
