/*
 * @flow
 */

import React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import Immutable from 'immutable';

import defaultUserIcon from '../../assets/images/user-profile-icon.png';
import { formatValue, formatDateList } from '../../utils/Utils';
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

  const firstName = formatValue(person.get(FIRST_NAME, Immutable.List()));
  const lastName = formatValue(person.get(LAST_NAME, Immutable.List()));
  const dob = formatDateList(person.get(DOB, Immutable.List()), 'MMMM D, YYYY');
  const suffix = formatValue(person.get(SUFFIX, Immutable.List()));
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
            <DataElem>{ dob }</DataElem>
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
