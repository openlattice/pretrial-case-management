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
  SUFFIX,
  MUGSHOT,
  PERSON_ID,
  PICTURE
} = PROPERTY_TYPES;

const Cell = styled.td`
  padding: 7px 0;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
`;

const Row = styled.tr`
  padding: 7px 30px;
  border-bottom: 1px solid ${OL.GREY11};
  border-left: 1px solid ${OL.GREY11};
  border-right: 1px solid ${OL.GREY11};

  ${Cell} {
    color: ${props => (props.gray ? OL.GREY02 : OL.GREY15)};
  }

  ${Cell}:first-child {
    padding-left: 30px;
  }

  ${Cell}:last-child {
    padding-right: 30px;
  }

  &:hover {
    cursor: pointer;
    background: ${OL.GREY14};
  }

  &:active {
    background-color: ${OL.GREY08};
  }
`;

type Props = {
  person :Immutable.Map<*, *>,
  handleSelect? :(person :Immutable.Map<*, *>, entityKeyId :string, id :string) => void,
  gray? :boolean
};

const PersonRow = ({ person, handleSelect, gray } :Props) => {

  let mugshot :string = person.getIn([MUGSHOT, 0]);
  if (!mugshot) mugshot = person.getIn([PICTURE, 0]);
  mugshot = mugshot
    ? (
      <PersonMugshot>
        <PersonPicture src={mugshot} alt="" />
      </PersonMugshot>
    ) : <PersonPicture src={defaultUserIcon} alt="" />;

  const firstName = formatValue(person.get(FIRST_NAME, Immutable.List()));
  const middleName = formatValue(person.get(MIDDLE_NAME, Immutable.List()));
  const lastName = formatValue(person.get(LAST_NAME, Immutable.List()));
  const dob = formatDateList(person.get(DOB, Immutable.List()), 'MM/DD/YYYY');
  const suffix = formatValue(person.get(SUFFIX, Immutable.List()));
  const id :string = person.getIn([PERSON_ID, 0], '');
  const displayId = id.length <= 11 ? id : `${id.substr(0, 10)}...`;
  const entityKeyId :string = person.getIn([OPENLATTICE_ID_FQN, 0], '');

  return (
    <Row
        gray={gray}
        onClick={() => {
          if (handleSelect) {
            handleSelect(person, entityKeyId, id);
          }
        }
        }>
      <Cell>{mugshot}</Cell>
      <Cell>{ lastName }</Cell>
      <Cell>{ firstName }</Cell>
      <Cell>{ middleName }</Cell>
      <Cell>{ dob }</Cell>
      <Cell>{ displayId }</Cell>
    </Row>
  );
};

PersonRow.defaultProps = {
  handleSelect: () => {},
  gray: false
};

export default PersonRow;
