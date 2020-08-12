/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map, List } from 'immutable';
import { Constants } from 'lattice';
import { Tooltip } from 'lattice-ui-kit';

import defaultUserIcon from '../../assets/svg/profile-placeholder-round.svg';
import { getNameTooltip } from '../../utils/PeopleUtils';
import { formatDate } from '../../utils/FormattingUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PersonPicture, PersonMugshot } from '../../utils/Layout';
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

const StyledDetailItem = styled(DetailItem)`
  width: 100%;
  position: relative;

  h1 {
    margin-bottom: 2px;
  }
`;

type Props = {
  person :Map;
  handleSelect? :(person :Map, entityKeyId :string, id :string) => void;
  includesPretrialModule ?:boolean;
};

const PersonCard = ({ person, handleSelect, includesPretrialModule } :Props) => {
  const mugshotString :string = person.getIn([MUGSHOT, 0]) || person.getIn([PICTURE, 0]);
  const mugshot = mugshotString
    ? (
      <PersonMugshot>
        <PersonPicture src={mugshotString} />
      </PersonMugshot>
    ) : <PersonPicture src={defaultUserIcon} />;

  const firstName = person.get(FIRST_NAME, List());
  const middleName = person.get(MIDDLE_NAME, List());
  const lastName = person.get(LAST_NAME, List());
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
            { getNameTooltip(lastName) }
          </StyledDetailItem>

          <StyledDetailItem>
            <h1>FIRST NAME</h1>
            { getNameTooltip(firstName) }
          </StyledDetailItem>

          <StyledDetailItem>
            <h1>MIDDLE NAME</h1>
            { getNameTooltip(middleName) }
          </StyledDetailItem>

          <StyledDetailItem>
            <h1>DATE OF BIRTH</h1>
            <Tooltip arrow position="top" title={dob}>
              <div>{dob}</div>
            </Tooltip>
          </StyledDetailItem>

          <StyledDetailItem>
            {
              includesPretrialModule
                ? (
                  <>
                    <h1>IDENTIFIER</h1>
                    <Tooltip arrow position="top" title={id}>
                      <div>{id}</div>
                    </Tooltip>
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
