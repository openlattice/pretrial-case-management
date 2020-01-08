/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';
import { Constants } from 'lattice';

import defaultUserIcon from '../../assets/svg/profile-placeholder-round.svg';
import { PersonPicture, PersonMugshot } from '../../utils/Layout';
import { formatValue, formatDateList } from '../../utils/FormattingUtils';
import { OL } from '../../utils/consts/Colors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

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

const Cell = styled.td`
  padding: 7px 0;
  font-family: 'Open Sans', sans-serif;
  font-size: ${(props) => (props.small ? 12 : 14)}px;
`;
const StyledPersonMugshot = styled(PersonMugshot)`
  width: ${(props) => (props.small ? 30 : 36)}px;
  ${(props) => (props.small
    ? (
      `min-width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;`
    )
    : ''
  )}
`;

const Row = styled.tr`
  padding: 7px 30px;
  border-bottom: 1px solid ${OL.GREY11};
  border-left: 1px solid ${OL.GREY11};
  border-right: 1px solid ${OL.GREY11};

  ${Cell} {
    color: ${(props) => (props.gray ? OL.GREY02 : OL.GREY15)};
  }
  /* stylelint-disable-next-line selector-type-no-unknown */
  ${Cell}:first-child {
    padding-left: 30px;
  }

  /* stylelint-disable-next-line selector-type-no-unknown */
  ${Cell}:last-child {
    padding-right: 30px;
  }

  &:hover {
    cursor: pointer;
    background: ${OL.GREY14};
  }

  &:active {
    background-color: ${OL.PURPLE06};
  }

  background-color: ${(props) => (props.active ? OL.PURPLE06 : 'none')};
`;

type Props = {
  person :Immutable.Map<*, *>,
  handleSelect? :(person :Immutable.Map<*, *>, entityKeyId :string, id :string) => void,
  gray? :boolean,
  selected? :boolean,
  small? :boolean,
};

const PersonRow = ({
  person,
  handleSelect,
  gray,
  selected,
  small
} :Props) => {

  let mugshot :string = person.getIn([MUGSHOT, 0]) || person.getIn([PICTURE, 0]);
  mugshot = mugshot
    ? (
      <StyledPersonMugshot small={small}>
        <PersonPicture src={mugshot} alt="" />
      </StyledPersonMugshot>
    ) : <PersonPicture small={small} src={defaultUserIcon} alt="" />;

  const firstName = formatValue(person.get(FIRST_NAME, Immutable.List()));
  const middleName = formatValue(person.get(MIDDLE_NAME, Immutable.List()));
  const lastName = formatValue(person.get(LAST_NAME, Immutable.List()));
  const dob = formatDateList(person.get(DOB, Immutable.List()));
  const id :string = person.getIn([PERSON_ID, 0], '');
  const displayId = id.length <= 11 ? id : `${id.substr(0, 10)}...`;
  const entityKeyId :string = person.getIn([OPENLATTICE_ID_FQN, 0], '');

  return (
    <Row
        active={selected}
        gray={gray}
        onClick={() => {
          if (handleSelect) {
            handleSelect(person, entityKeyId);
          }
        }}>
      <Cell small={small}>{ mugshot }</Cell>
      <Cell small={small}>{ lastName }</Cell>
      <Cell small={small}>{ firstName }</Cell>
      <Cell small={small}>{ middleName }</Cell>
      <Cell small={small}>{ dob }</Cell>
      <Cell small={small}>{ displayId }</Cell>
    </Row>
  );
};

PersonRow.defaultProps = {
  handleSelect: () => {},
  gray: false,
  selected: false,
  small: false
};

export default PersonRow;
