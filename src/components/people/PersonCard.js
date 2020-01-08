/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone } from '@fortawesome/pro-light-svg-icons';
import { faBell } from '@fortawesome/pro-solid-svg-icons';

import defaultProfile from '../../assets/svg/profile-placeholder-avatar.svg';
import StyledCard from '../StyledCard';
import { OL } from '../../utils/consts/Colors';
import { UndecoratedLink } from '../../utils/Layout';

import * as Routes from '../../core/router/Routes';

const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Dob = styled.span`
  color: ${OL.GREY15};
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  margin-right: 5px;
`;

const DobLabel = styled.span`
  color: ${OL.GREY02};
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
`;

const MugShot = styled.img`
  border-radius: 7px 0 0 7px;
  height: 100%;
`;

const MultiIconWrapper = styled.span`
  display: flex;
  justify-content: flex-end;
  position: absolute;
  transform: ${(props) => (props.judgesview ? 'translateX(192px)' : 'translateX(264px)')};
  width: 30px;
  z-index: 1;

  svg {
    margin-left: 5px;
  }
`;

const Name = styled.div`
  color: ${OL.GREY15};
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 5px 0 4px;
  text-transform: uppercase;
`;

const OpenPSATag = styled.span`
  align-items: center;
  background-color: ${OL.PURPLE07};
  border-radius: 3px;
  color: ${OL.WHITE};
  display: flex;
  flex-direction: row;
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  height: 16px;
  justify-content: center;
  margin-left: 100px;
  margin-bottom: -8px;
  padding: 5px 0;
  text-transform: uppercase;
  width: 75px;
  z-index: 1;
`;

const PersonInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 20px;
`;

const StyledPersonCard = styled(StyledCard)`
  box-shadow: ${(props) => (props.hasOpenPSA ? `0 0 5px 5px ${OL.PURPLE06}` : 'none')};
  width: 100%;
`;

const StyledUndecoratedLink = styled(UndecoratedLink)`
  display: flex;
  flex-direction: column;
`;

const TagPlaceholder = styled.span`
  height: 8px;
`;

type Props = {
  editDate :string;
  hasOpenPSA? :boolean;
  isReceivingReminders :boolean;
  judgesview? :boolean;
  multipleOpenPSAs? :boolean;
  openPSAModal :(psaId :string, callback :() => void) => void;
  personObj :{
    firstName :string;
    middleName :string;
    lastName :string;
    dob :string;
    photo :string;
    personId :string;
    personEntityKeyId :string;
  };
  psaId :string;
};

type State = {
  psaModalOpen :boolean;
  closingPSAModalOpen :boolean;
  closePSAButtonActive :boolean;
};

class PersonCard extends React.Component<Props, State> {

  static defaultProps = {
    hasOpenPSA: false,
    judgesview: false,
    multipleOpenPSAs: false,
  }

  openPSAModal = () => {
    const { openPSAModal, psaId } = this.props;
    if (openPSAModal && psaId) {
      openPSAModal({ psaId });
    }
  }

  renderCardContent = () => {
    const {
      personObj,
      multipleOpenPSAs,
      hasOpenPSA,
      isReceivingReminders,
      judgesview
    } = this.props;
    const {
      firstName,
      middleName,
      lastName,
      dob,
      photo,
    } = personObj;

    const midName = middleName ? ` ${middleName}` : '';
    const name = `${lastName}, ${firstName}${midName}`;
    return (
      <>
        {
          multipleOpenPSAs || isReceivingReminders
            ? (
              <MultiIconWrapper judgesview={judgesview}>
                { isReceivingReminders ? <FontAwesomeIcon color={OL.ORANGE01} icon={faBell} /> : null }
                { multipleOpenPSAs ? <FontAwesomeIcon color={OL.PURPLE02} icon={faClone} /> : null }
              </MultiIconWrapper>
            ) : null
        }
        <StyledPersonCard hasOpenPSA={hasOpenPSA} onClick={this.openPSAModal}>
          <MugShot src={photo || defaultProfile} />
          <PersonInfoSection>
            <Name>{name}</Name>
            <div>
              <DobLabel>DOB  </DobLabel>
              <Dob>{dob}</Dob>
            </div>
          </PersonInfoSection>
        </StyledPersonCard>
      </>
    );
  }

  renderCard = () => {
    const {
      editDate,
      personObj,
      hasOpenPSA,
      judgesview
    } = this.props;
    const { personEntityKeyId } = personObj;

    return hasOpenPSA && judgesview
      ? (
        <CardWrapper>
          <OpenPSATag includesDate>{editDate}</OpenPSATag>
          { this.renderCardContent() }
        </CardWrapper>
      )
      : (
        <StyledUndecoratedLink to={`${Routes.PERSON_DETAILS_ROOT}/${personEntityKeyId}`}>
          <TagPlaceholder />
          { this.renderCardContent() }
        </StyledUndecoratedLink>
      );
  }

  render() {
    return (
      <div>
        { this.renderCard() }
      </div>
    );
  }
}


export default PersonCard;
