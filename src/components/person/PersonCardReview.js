/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map, List } from 'immutable';
import { Constants } from 'lattice';

import defaultUserIcon from '../../assets/svg/profile-placeholder-round.svg';
import { formatValue, formatDate } from '../../utils/FormattingUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PersonPicture, PersonMugshot } from '../../utils/Layout';
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

const StyledPersonCardWrapper = styled(PersonCardWrapper)`
  width: 100%;
`;

const StyledDetailsWrapper = styled(DetailsWrapper)`
  margin: 0 20px 0 0;
  flex-direction: row;
  width: 100%;
`;

const StyledDetailRow = styled(DetailRow)`
  width: 100%;
  display: grid;
  grid-template-columns: 5% 17% 17% 17% 17% 17%;
  text-transform: uppercase;
`;

const StyledReviewTooltip = styled(StyledTooltip)`
  transform: translateX(-50%);
`;

const StyledDetailItem = styled(DetailItem)`
  width: 100%;
  position: relative;

  h1 {
    margin-bottom: 2px;
  }

  &:hover ${StyledReviewTooltip} {
    visibility: visible;
  }
`;

type Props = {
  person :Map;
  handleSelect? :(person :Map, entityKeyId :string, id :string) => void;
  includesPretrialModule ?:boolean;
};

const Tooltip = ({ value } :Object) => (
  value && value.length ? <StyledReviewTooltip>{value}</StyledReviewTooltip> : null
);

const PersonCard = ({ person, handleSelect, includesPretrialModule } :Props) => {
  let mugshot :string = person.getIn([MUGSHOT, 0]) || person.getIn([PICTURE, 0]);
  mugshot = mugshot
    ? (
      <PersonMugshot>
        <PersonPicture src={mugshot} alt="" />
      </PersonMugshot>
    ) : <PersonPicture src={defaultUserIcon} alt="" />;

  const firstName = formatValue(person.get(FIRST_NAME, List()));
  const middleName = formatValue(person.get(MIDDLE_NAME, List()));
  const lastName = formatValue(person.get(LAST_NAME, List()));
  const dob = formatDate(person.getIn([DOB, 0], ''));
  const id :string = person.getIn([PERSON_ID, 0], '');
  const entityKeyId :string = person.getIn([OPENLATTICE_ID_FQN, 0], '');

  return (
    <StyledPersonCardWrapper
        key={id}
        onClick={() => {
          if (handleSelect) {
            handleSelect(person, entityKeyId, id);
          }
        }}>
      <StyledDetailsWrapper>
        <StyledDetailRow>
          <StyledDetailItem>
            { mugshot }
          </StyledDetailItem>

          <StyledDetailItem>
            <h1>LAST NAME</h1>
            <div>{lastName}</div>
            <Tooltip value={lastName} />
          </StyledDetailItem>

          <StyledDetailItem>
            <h1>FIRST NAME</h1>
            <div>{firstName}</div>
            <Tooltip value={firstName} />
          </StyledDetailItem>

          <StyledDetailItem>
            <h1>MIDDLE NAME</h1>
            <div>{middleName}</div>
            <Tooltip value={middleName} />
          </StyledDetailItem>

          <StyledDetailItem>
            <h1>DATE OF BIRTH</h1>
            <div>{dob}</div>
            <Tooltip value={dob} />
          </StyledDetailItem>

          <StyledDetailItem>
            {
              includesPretrialModule
                ? (
                  <>
                    <h1>IDENTIFIER</h1>
                    <div>{id}</div>
                    <Tooltip value={id} />
                  </>
                ) : null
            }
          </StyledDetailItem>
        </StyledDetailRow>
      </StyledDetailsWrapper>
    </StyledPersonCardWrapper>
  );
};

PersonCard.defaultProps = {
  handleSelect: () => {},
  includesPretrialModule: false
};

export default PersonCard;
