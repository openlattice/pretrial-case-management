/*
 * @flow
 */
import styled from 'styled-components';
import React from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { faMicrophoneAlt, faMicrophoneAltSlash } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import EnrollVoiceModal from './EnrollVoiceModal';
import { OL } from '../../utils/consts/Colors';
import { getEntityProperties } from '../../utils/DataUtils';
import { formatPersonName, formatPeopleInfo } from '../../utils/PeopleUtils';
import { InputRow } from '../person/PersonFormTags';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

import * as EnrollActionFactory from '../../containers/enroll/EnrollActionFactory';

const {
  ENTITY_KEY_ID,
  FIRST_NAME,
  LAST_NAME,
  MIDDLE_NAME,
  PERSON_ID
} = PROPERTY_TYPES;

const Status = styled(InputRow)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 10px 0;
`;

const StatusText = styled.div`
  font-size: 16px;
  font-weight: 600;
  padding: 5px 10px;
`;

const StatusIconContainer = styled.div`
  margin: 5px 0;
`;

const UnderlinedTextButton = styled.div`
  display: block;
  color: ${OL.PURPLE02};
  text-decoration: 'underline';
  :hover {
    cursor: pointer;
  }
`;

type Props = {
  person :Map<*, *>,
  personVoiceProfile :boolean,
  actions :{
    clearEnrollState :() => void
  }
};

class EnrollStatusBanner extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      enrollVoiceModalOpen: false
    };
  }

  openEnrollVoiceModal = () => this.setState({ enrollVoiceModalOpen: true });
  closeEnrollVoiceModal = () => {
    const { actions } = this.props;
    this.setState({ enrollVoiceModalOpen: false });
    actions.clearEnrollState();
  };

  renderVoiceEnrollmentModal = () => {
    const { enrollVoiceModalOpen } = this.state;
    const { person } = this.props;
    const {
      [PERSON_ID]: personId,
      [FIRST_NAME]: firstName,
      [MIDDLE_NAME]: middleName,
      [LAST_NAME]: lastName,
      [ENTITY_KEY_ID]: personEntityKeyId,
    } = getEntityProperties(person, [PERSON_ID, ENTITY_KEY_ID]);
    const { firstMidLast } = formatPersonName(firstName, middleName, lastName);
    return (
      <EnrollVoiceModal
          personId={personId}
          personEntityKeyId={personEntityKeyId}
          personName={firstMidLast}
          open={enrollVoiceModalOpen}
          onClose={this.closeEnrollVoiceModal} />
    );
  }

  renderEnrollPersonButton = () => {
    const { personVoiceProfile } = this.props;
    const { [PROPERTY_TYPES.PIN]: pin } = getEntityProperties(personVoiceProfile, [PROPERTY_TYPES.PIN]);
    const enrollmentButtonText = pin ? `PIN: ${pin}` : 'Enroll';
    return (
      <UnderlinedTextButton onClick={this.openEnrollVoiceModal}>{ enrollmentButtonText }</UnderlinedTextButton>
    );
  }

  renderEnrollmentIcon = () => {
    const { personVoiceProfile } = this.props;
    return personVoiceProfile.size
      ? <StatusIconContainer><FontAwesomeIcon color="green" icon={faMicrophoneAlt} /></StatusIconContainer>
      : <StatusIconContainer><FontAwesomeIcon color="red" icon={faMicrophoneAltSlash} /></StatusIconContainer>;
  }

  renderEnrollmentText = () => {
    const { person, personVoiceProfile } = this.props;
    const { firstMidLast } = formatPeopleInfo(person);
    return personVoiceProfile.size
      ? `${firstMidLast} is enrolled in check-ins`
      : `${firstMidLast} is not enrolled in check-ins`;
  }

  renderEnrollmentBanner = () => (
    <>
      <Status>
        { this.renderEnrollmentIcon() }
        <StatusText>{this.renderEnrollmentText()}</StatusText>
        { this.renderEnrollPersonButton() }
      </Status>
      { this.renderVoiceEnrollmentModal() }
    </>
  );

  render() {
    return this.renderEnrollmentBanner();
  }
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(EnrollActionFactory).forEach((action :string) => {
    actions[action] = EnrollActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(null, mapDispatchToProps)(EnrollStatusBanner);
