/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';

import defaultUserIcon from '../../assets/svg/profile-placeholder-round.svg';
import { formatValue, formatDate } from '../../utils/Utils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const {
  DOB,
  FIRST_NAME,
  MIDDLE_NAME,
  LAST_NAME,
  MUGSHOT,
  PERSON_ID,
  PICTURE
} = PROPERTY_TYPES;

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const DetailsWrapper = styled.div`
  margin: 0 20px;
  display: flex;
  flex-direction: row;
  width: 100%;
`;

const DetailRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
  text-transform: uppercase;
`;

const StyledTooltip = styled.div`
  visibility: hidden;
  position: absolute;
  z-index: 10;
  transform: translateX(-50%);
  bottom: -40px;
  left: 15%;
  border-radius: 5px;
  box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.1);
  background-color: #f9f9fd;
  border: solid 1px #dcdce7;
  max-width: 320px;
  width: max-content;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: #2e2e34;
  padding: 8px 15px;
  white-space: normal !important;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  width: 20%;
  position: relative;

  h1 {
    font-family: 'Open Sans', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #8e929b;
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  div {
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    font-weight: normal;
    color: #2e2e34;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover ${StyledTooltip} {
    visibility: visible;
  }
`;


const PersonPicture = styled.img`
  height: 36px;
`;

type Props = {
  person :Immutable.Map<*, *>,
  handleSelect? :(person :Immutable.Map<*, *>, entityKeyId :string, id :string) => void
};

const Tooltip = ({ value }) => (
  value && value.length ? <StyledTooltip>{value}</StyledTooltip> : null
);

const PersonCard = ({ person, handleSelect } :Props) => {

  let pictureAsBase64 :string = person.getIn([MUGSHOT, 0]);
  if (!pictureAsBase64) pictureAsBase64 = person.getIn([PICTURE, 0]);
  const pictureImgSrc = pictureAsBase64 ? `data:image/png;base64,${pictureAsBase64}` : defaultUserIcon;

  const firstName = formatValue(person.get(FIRST_NAME, Immutable.List()));
  const middleName = formatValue(person.get(MIDDLE_NAME, Immutable.List()));
  const lastName = formatValue(person.get(LAST_NAME, Immutable.List()));
  const dob = formatDate(person.getIn([DOB, 0], ''), 'MM/DD/YYYY');
  const id :string = person.getIn([PERSON_ID, 0], '');
  const entityKeyId :string = person.getIn(['id', 0], '');

  return (
    <Wrapper
        key={id}
        onClick={() => {
          if (handleSelect) {
            handleSelect(person, entityKeyId, id);
          }
        }}>
      <PersonPicture src={pictureImgSrc} role="presentation" />
      <DetailsWrapper>
        <DetailRow>
          <DetailItem>
            <h1>LAST NAME</h1>
            <div>{lastName}</div>
            <Tooltip value={lastName} />
          </DetailItem>

          <DetailItem>
            <h1>FIRST NAME</h1>
            <div>{firstName}</div>
            <Tooltip value={firstName} />
          </DetailItem>

          <DetailItem>
            <h1>MIDDLE NAME</h1>
            <div>{middleName}</div>
            <Tooltip value={middleName} />
          </DetailItem>

          <DetailItem>
            <h1>DATE OF BIRTH</h1>
            <div>{dob}</div>
            <Tooltip value={dob} />
          </DetailItem>

          <DetailItem>
            <h1>IDENTIFIER</h1>
            <div>{id}</div>
            <Tooltip value={id} />
          </DetailItem>
        </DetailRow>
      </DetailsWrapper>
    </Wrapper>
  );
};

PersonCard.defaultProps = {
  handleSelect: () => {}
};

export default PersonCard;
