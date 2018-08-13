/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';
import { Constants } from 'lattice';

import defaultUserIcon from '../../assets/svg/profile-placeholder-rectangle-big.svg';
import { formatValue, formatDate } from '../../utils/FormattingUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const { OPENLATTICE_ID_FQN } = Constants;

const {
  DOB,
  FIRST_NAME,
  MIDDLE_NAME,
  LAST_NAME,
  SUFFIX,
  MUGSHOT,
  PERSON_ID,
  PICTURE
} = PROPERTY_TYPES;

const Wrapper = styled.div`
  width: 410px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const DetailsWrapper = styled.div`
  margin: 0 20px;
  display: flex;
  flex-direction: column;
  width: 300px;
`;

const DetailRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const StyledTooltip = styled.div`
  visibility: hidden;
  position: absolute;
  z-index: 1;
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
  width: 50%;
  position: relative;

  h1 {
    font-family: 'Open Sans', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #8e929b;
    text-transform: uppercase;
  }

  div {
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    color: #2e2e34;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover ${StyledTooltip} {
    visibility: visible;
  }
`;

const DetailItemWide = styled(DetailItem)`
  width: 100%;
`;


const PersonPicture = styled.img`
  max-height: 115px;
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
  const suffix = formatValue(person.get(SUFFIX, Immutable.List()));
  const id :string = person.getIn([PERSON_ID, 0], '');
  const entityKeyId :string = person.getIn([OPENLATTICE_ID_FQN, 0], '');

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
            <h1>MIDDLE NAME</h1>
            <div>{middleName}</div>
            <Tooltip value={middleName} />
          </DetailItem>
        </DetailRow>
        <DetailRow>
          <DetailItem>
            <h1>FIRST NAME</h1>
            <div>{firstName}</div>
            <Tooltip value={firstName} />
          </DetailItem>
          <DetailItem>
            <h1>DATE OF BIRTH</h1>
            <div>{dob}</div>
            <Tooltip value={dob} />
          </DetailItem>
        </DetailRow>
        <DetailRow>
          <DetailItemWide>
            <h1>IDENTIFIER</h1>
            <div>{id}</div>
            <Tooltip value={id} />
          </DetailItemWide>
        </DetailRow>
      </DetailsWrapper>

    </Wrapper>
  );
};

PersonCard.defaultProps = {
  handleSelect: () => {}
};

export default PersonCard;
