/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCog, faTimesCircle } from '@fortawesome/pro-light-svg-icons';

import StyledButton from '../buttons/StyledButton';

import * as HearingsActionFactory from '../../containers/hearings/HearingsActionFactory';

const DownloadButtonContainer = styled.div`
  width: max-content;
  height: 100%;
  display: flex;
  align-items: center !important;
  justify-content: flex-end;
`;

class HearingSettingsButton extends React.Component<Props, State> {

  openHearingSettings = () => {
    const { actions } = this.props;
    actions.openHearingSettingsModal();
  }

  render() {
    return (
      <DownloadButtonContainer>
        <StyledButton onClick={this.openHearingSettings}>
          <FontAwesomeIcon icon={faCog} height="12px" />
          {' Hearing Presets'}
        </StyledButton>
      </DownloadButtonContainer>
    );
  }
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(HearingsActionFactory).forEach((action :string) => {
    actions[action] = HearingsActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(null, mapDispatchToProps)(HearingSettingsButton);
