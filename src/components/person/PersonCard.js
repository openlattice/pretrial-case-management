/*
 * @flow
 */

import React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import Immutable from 'immutable';

import defaultUserIcon from '../../assets/images/user-profile-icon.png';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const {
  DOB,
  FIRST_NAME,
  LAST_NAME,
  SUFFIX,
  MUGSHOT,
  PERSON_ID,
  PICTURE
} = PROPERTY_TYPES;

const PersonResultWrapper = styled.div`
  display: flex;
  text-align: left;
  flex-direction: row;
  flex: 1 0 auto;
  margin: 10px 0;
`;

const PersonPictureWrapper = styled.div`

`;

const PersonPicture = styled.img`
  max-height: 100px;
`;

const InfoRow = styled.tr`
  display: flex;
  justify-content: flex-start;
`;

const Header = styled.th`
  width: 95px;
  margin: 2px 5px 2px 0;
`;

const DataElem = styled.td`
  width: 200px;
  margin: 2px 0;
`;

type Props = {
  person :Immutable.Map<*, *>,
  handleSelect? :(person :Immutable.Map<*, *>, entityKeyId :string) => void
};

const PersonCard = ({ person, handleSelect } :Props) => {

  const Wrapper = styled(PersonResultWrapper)`
    &:hover {
      cursor: ${handleSelect ? 'pointer' : 'default'};
    },
    width: 150px;
  `;

  let pictureAsBase64 :string = person.getIn([MUGSHOT, 0]);
  if (!pictureAsBase64) pictureAsBase64 = person.getIn([PICTURE, 0]);
  const pictureImgSrc = pictureAsBase64 ? `data:image/png;base64,${pictureAsBase64}` : defaultUserIcon;

  const firstName = person.getIn([FIRST_NAME, 0]);
  const lastName = person.getIn([LAST_NAME, 0]);
  const dob = person.getIn([DOB, 0]);
  const suffix = person.getIn([SUFFIX, 0]);
  let dobFormatted = dob;
  if (dob) {
    dobFormatted = moment.utc(dob).format('MMMM D, YYYY');
  }
  const id :string = person.getIn([PERSON_ID, 0], '');
  const entityKeyId :string = person.getIn(['id', 0], '');

  return (
    <Wrapper
        key={id}
        onClick={() => {
          if (handleSelect) {
            handleSelect(person, entityKeyId);
          }
        }}>
      <PersonPictureWrapper>
        <PersonPicture src={pictureImgSrc} role="presentation" />
      </PersonPictureWrapper>
      <table>
        <tbody>
          <InfoRow>
            <Header>First Name:</Header>
            <DataElem>{ firstName }</DataElem>
          </InfoRow>
          <InfoRow>
            <Header>Last Name:</Header>
            <DataElem>{ lastName }</DataElem>
          </InfoRow>
          { suffix ? (
            <InfoRow>
              <Header>Suffix:</Header>
              <DataElem>{ suffix }</DataElem>
            </InfoRow>
          ) : null
          }
          <InfoRow>
            <Header>Date of Birth:</Header>
            <DataElem>{ dobFormatted }</DataElem>
          </InfoRow>
          <InfoRow>
            <Header>Identifier:</Header>
            <DataElem>{ id }</DataElem>
          </InfoRow>
        </tbody>
      </table>
    </Wrapper>
  );
};

PersonCard.defaultProps = {
  handleSelect: () => {}
};

export default PersonCard;
