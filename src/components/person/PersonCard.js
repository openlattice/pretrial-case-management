/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Constants } from 'lattice';
import { Tooltip } from 'lattice-ui-kit';

import defaultUserIcon from '../../assets/svg/profile-placeholder-rectangle-big.svg';
import { PersonPicture } from '../../utils/Layout';
import { formatValue, formatDate } from '../../utils/FormattingUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getNameTooltip } from '../../utils/PeopleUtils';
import {
  PersonCardWrapper,
  DetailsWrapper,
  DetailRow,
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
  person :Map;
  handleSelect ?:(
    person :Map,
    entityKeyId :string,
    id :string
  ) => void
};

const PersonCard = ({ person, handleSelect } :Props) => {

  let mugshot = person.getIn([MUGSHOT, 0]) || person.getIn([PICTURE, 0]);
  mugshot = mugshot
    ? <StyledPersonPicture src={mugshot} />
    : <StyledPersonPicture src={defaultUserIcon} />;

  const firstName :List = person.get(FIRST_NAME, List());
  const middleName :List = person.get(MIDDLE_NAME, List());
  const lastName :List = person.get(LAST_NAME, List());
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
            { getNameTooltip(lastName) }
          </DetailItem>
          <DetailItem>
            <h1>MIDDLE NAME</h1>
            { getNameTooltip(middleName) }
          </DetailItem>
        </DetailRow>
        <DetailRow>
          <DetailItem>
            <h1>FIRST NAME</h1>
            { getNameTooltip(firstName) }
          </DetailItem>
          <DetailItem>
            <h1>DATE OF BIRTH</h1>
            <Tooltip arrow placement="top" title={dob}>
              <div>{dob}</div>
            </Tooltip>
          </DetailItem>
        </DetailRow>
        <DetailRow>
          <DetailItemWide>
            <h1>IDENTIFIER</h1>
            <Tooltip arrow placement="top" title={id}>
              <div>{id}</div>
            </Tooltip>
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
