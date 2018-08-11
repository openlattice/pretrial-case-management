/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';
import { Constants } from 'lattice';

import defaultUserIcon from '../../assets/svg/profile-placeholder-round.svg';
import { formatValue, formatDateList } from '../../utils/FormattingUtils';
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
  border-bottom: 1px solid #e1e1eb;
  border-left: 1px solid #e1e1eb;
  border-right: 1px solid #e1e1eb;

  ${Cell} {
    color: ${props => (props.gray ? '#8e929b' : '#2e2e34')};
  }

  ${Cell}:first-child {
    padding-left: 30px;
  }

  ${Cell}:last-child {
    padding-right: 30px;
  }

  &:hover {
    cursor: pointer;
    background: #f8f8fc;
  }

  &:active {
    background-color: #f0f0f7;
  }
`;

type Props = {
  person :Immutable.Map<*, *>,
  handleSelect? :(person :Immutable.Map<*, *>, entityKeyId :string, id :string) => void,
  gray? :boolean
};

const PersonRow = ({ person, handleSelect, gray } :Props) => {

  let pictureAsBase64 :string = person.getIn([MUGSHOT, 0]);
  if (!pictureAsBase64) pictureAsBase64 = person.getIn([PICTURE, 0]);
  const pictureImgSrc = pictureAsBase64 ? `data:image/png;base64,${pictureAsBase64}` : defaultUserIcon;

  const firstName = formatValue(person.get(FIRST_NAME, Immutable.List()));
  const middleName = formatValue(person.get(MIDDLE_NAME, Immutable.List()));
  const lastName = formatValue(person.get(LAST_NAME, Immutable.List()));
  const dob = formatDateList(person.get(DOB, Immutable.List()), 'MM/DD/YYYY');
  const suffix = formatValue(person.get(SUFFIX, Immutable.List()));
  const id :string = person.getIn([PERSON_ID, 0], '');
  const displayId = id.length <= 11 ? id : `${id.substr(0, 10)}...`;
  const entityKeyId :string = person.getIn([OPENLATTICE_ID_FQN, 0], '');

  return (
    <Row gray={gray} onClick={() => {
      if (handleSelect) {
        handleSelect(person, entityKeyId, id);
      }
    }}>
      <Cell><img src={pictureImgSrc} role="presentation" /></Cell>
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
