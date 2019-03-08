/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone } from '@fortawesome/pro-light-svg-icons';

import CONTENT from '../../utils/consts/ContentConsts';
import defaultProfile from '../../assets/svg/profile-placeholder-avatar.svg';
import PSAModal from '../../containers/psamodal/PSAModal';
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
  margin-left: 75px;
  margin-bottom: -8px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 125px;
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
  z-index: 1;
  position: absolute;
  transform: translateX(208px) translateY(-2px);
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
    firstName :string,
    middleName :string,
    lastName :string,
    dob :string,
    photo :string,
    identification :string
  },
  scores :Immutable.Map<*, *>,
  hasOpenPSA? :boolean,
  judgesview? :boolean,
  loadCaseHistoryFn :(values :{
    personId :string,
    neighbors :Immutable.Map<*, *>
  }) => void,
  loadHearingNeighbors :(hearingIds :string[]) => void,
};

type State = {
  psaModalOpen :boolean,
  closingPSAModalOpen :boolean,
  closePSAButtonActive :boolean
};

class PersonCard extends React.Component<Props, State> {

  static defaultProps = {
    hasOpenPSA: false,
    judgesview: false
  }

  constructor(props :Props) {
    super(props);
    this.state = {
      psaModalOpen: false
    };
  }

  onClose = () => (this.setState({ psaModalOpen: false }));

  renderModal = () => {
    const { props } = this;
    const { psaId } = this.props;
    const { psaModalOpen } = this.state;
    const modalProps = {};
    Object.keys(this.props).forEach((prop) => {
      (modalProps[prop] = Immutable.fromJS(props[prop]));
    });
    return (
      <PSAModal
          open={psaModalOpen}
          view={CONTENT.JUDGES}
          onClose={this.onClose}
          entityKeyId={psaId}
          {...modalProps} />
    );
  }


  openDetailsModal = () => {
    const {
      psaId,
      loadCaseHistoryFn,
      loadPSAModal
    } = this.props;
    loadPSAModal({ psaId, callback: loadCaseHistoryFn });
    this.setState({ psaModalOpen: true });
  }

  renderContent = () => {
    const { editDate, personObj } = this.props;
    const {
      firstName,
      middleName,
      lastName,
      dob,
      photo,
      identification
    } = personObj;
    const { multipleOpenPSAs, hasOpenPSA, judgesview } = this.props;

    const midName = middleName ? ` ${middleName}` : '';
    const name = `${lastName}, ${firstName}${midName}`;

    return hasOpenPSA && judgesview
      ? (
        <CardWrapper>
          { this.renderModal() }
          <OpenPSATag>{`Open PSA: ${editDate}`}</OpenPSATag>
          {
            multipleOpenPSAs
              ? (
                <MultiIconWrapper>
                  <FontAwesomeIcon color={OL.PURPLE03} icon={faClone} />
                </MultiIconWrapper>
              ) : null
          }
          <StyledPersonCard onClick={this.openDetailsModal}>
            <MugShot src={photo || defaultProfile} />
            <PersonInfoSection>
              <Name>{name}</Name>
              <div>
                <DobLabel>DOB  </DobLabel>
                <Dob>{dob}</Dob>
              </div>
            </PersonInfoSection>
          </StyledPersonCard>
        </CardWrapper>
      )
      : (
        <StyledUndecoratedLink to={`${Routes.PERSON_DETAILS_ROOT}/${identification}`}>
          <TagPlaceholder />
          <StyledPersonCard>
            <MugShot src={photo || defaultProfile} />
            <PersonInfoSection>
              <Name>{name}</Name>
              <div>
                <DobLabel>DOB  </DobLabel>
                <Dob>{dob}</Dob>
              </div>
            </PersonInfoSection>
          </StyledPersonCard>
        </StyledUndecoratedLink>
      );
  }

  render() {
    return (
      <div>
        {this.renderContent()}
      </div>
    );
  }
}


export default PersonCard;
