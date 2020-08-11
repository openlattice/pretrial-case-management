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

const StyledUndecoratedLink = styled(UndecoratedLink)`
  display: flex;
  flex-direction: column;
`;

const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledPersonCard = styled(StyledCard)`
  box-shadow: ${(props) => (props.hasOpenPSA ? `0 0 5px 5px ${OL.PURPLE06}` : 'none')};
  width: 100%;
`;

const PersonInfoSection = styled.div`
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Name = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: ${OL.GREY15};
  margin-bottom: 5px 0 4px;
  text-transform: uppercase;
`;

const DobLabel = styled.span`
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  color: ${OL.GREY02};
`;

const Dob = styled.span`
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  color: ${OL.GREY15};
  margin-right: 5px;
`;

const OpenPSATag = styled.span`
  z-index: 1;
  margin-left: 100px;
  margin-bottom: -8px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 75px;
  height: 16px;
  border-radius: 3px;
  background-color: ${OL.PURPLE07};
  padding: 5px 0;
  text-transform: uppercase;
  color: ${OL.WHITE};
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
`;

const MultiIconWrapper = styled.span`
  width: 30px;
  display: flex;
  justify-content: flex-end;
  z-index: 1;
  position: absolute;
  transform: ${(props) => (props.judgesview ? 'translateX(192px)' : 'translateX(264px)')};
  svg {
    margin-left: 5px;
  }
`;

const TagPlaceholder = styled.span`
  height: 8px;
`;

const MugShot = styled.img`
  height: 100%;
  border-radius: 7px 0 0 7px;
`;

type Props = {
  personObj :{
    lastFirstMid :Object,
    dob :string,
    photo :string,
    personId :string;
    personEntityKeyId :string;
  },
  psaId :string,
  editDate :string,
  hasOpenPSA? :boolean,
  multipleOpenPSAs? :boolean,
  judgesview? :boolean,
  isReceivingReminders :boolean,
  openPSAModal :(psaId :string, callback :() => void) => void,
};

type State = {
  psaModalOpen :boolean,
  closingPSAModalOpen :boolean,
  closePSAButtonActive :boolean
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
  };

  renderCardContent = () => {
    const {
      personObj,
      multipleOpenPSAs,
      hasOpenPSA,
      isReceivingReminders,
      judgesview
    } = this.props;
    const {
      lastFirstMid,
      dob,
      photo,
    } = personObj;

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
            { lastFirstMid }
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
