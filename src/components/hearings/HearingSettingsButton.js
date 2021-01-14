/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button } from 'lattice-ui-kit';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/pro-light-svg-icons';

import { openHearingSettingsModal } from '../../containers/hearings/HearingsActions';

const CogIcon = <FontAwesomeIcon icon={faCog} />;

const DownloadButtonContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center !important;
  justify-content: flex-end;

  button {
    width: max-content;
  }
`;

type Props = {
  actions :{
    openHearingSettingsModal :() => void;
  };
};

class HearingSettingsButton extends React.Component<Props> {

  openHearingSettings = () => {
    const { actions } = this.props;
    actions.openHearingSettingsModal();
  }

  render() {
    return (
      <DownloadButtonContainer>
        <Button color="secondary" startIcon={CogIcon} onClick={this.openHearingSettings}>
          Hearing Presets
        </Button>
      </DownloadButtonContainer>
    );
  }
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Hearings Actions
    openHearingSettingsModal
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(HearingSettingsButton);
