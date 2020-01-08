/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';
import { Constants } from 'lattice';

import defaultUserIcon from '../../assets/svg/profile-placeholder-rectangle-big.svg';
import { PersonPicture } from '../../utils/Layout';
import { formatValue, formatDate } from '../../utils/FormattingUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  PersonCardWrapper,
  DetailsWrapper,
  DetailRow,
  StyledTooltip,
  DetailItem
} from './PersonStyledTags';

const { OPENLATTICE_ID_FQN } = Constants;

const {
  DOB,
  FIRST_NAME,
  MIDDLE_NAME,
  LAST_NAME,
  MUGSHOT,
  PERSON_ID,
  PICTURE
} = PROPERTY_TYPES;

const DetailItemWide = styled(DetailItem)`
  width: 100%;
`;

const StyledPersonPicture = styled(PersonPicture)`
  height: 140px;
  width: auto;
`;

type Props = {
  person :Immutable.Map<*, *>,
  handleSelect? :(person :Immutable.Map<*, *>, entityKeyId :string, id :string) => void
};

const Tooltip = ({ value } :Object) => (
  value && value.length ? <StyledTooltip>{value}</StyledTooltip> : null
);

const PersonCard = ({ person, handleSelect } :Props) => {

  let mugshot = person.getIn([MUGSHOT, 0]) || person.getIn([PICTURE, 0]);
  mugshot = mugshot
    ? <StyledPersonPicture src={mugshot} alt="" />
    : <StyledPersonPicture src={defaultUserIcon} alt="" />;

  const firstName = formatValue(person.get(FIRST_NAME, Immutable.List()));
  const middleName = formatValue(person.get(MIDDLE_NAME, Immutable.List()));
  const lastName = formatValue(person.get(LAST_NAME, Immutable.List()));
  const dob = formatDate(person.getIn([DOB, 0], ''));
  const id :string = person.getIn([PERSON_ID, 0], '');
  const entityKeyId :string = person.getIn([OPENLATTICE_ID_FQN, 0], '');

  return (
    <PersonCardWrapper
        key={id}
        onClick={() => {
          if (handleSelect) {
            handleSelect(person, entityKeyId, id);
          }
        }}>
      { mugshot }
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

    </PersonCardWrapper>
  );
};

PersonCard.defaultProps = {
  handleSelect: () => {}
};

export default PersonCard;
