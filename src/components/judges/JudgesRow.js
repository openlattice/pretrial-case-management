/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Button } from 'lattice-ui-kit';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/pro-regular-svg-icons';

import { OL } from '../../utils/consts/Colors';

const plusIcon = <FontAwesomeIcon icon={faPlus} />;
const minusIcon = <FontAwesomeIcon icon={faMinus} />;

const Cell = styled.td`
  color: ${OL.GREY15};
  font-size: 14px;
  padding: 5px 10px;
  text-align: left;
`;

const Row = styled.tr`
  border-bottom: 1px solid ${OL.GREY11};
  padding: 7px 30px;

  &:active {
    background-color: ${OL.GREY08};
  }

  &:last-child {
    border-bottom: none;
  }
`;

type Props = {
  data :Object;
  handleUpdate :(judge :Object) => void;
  isLoading :boolean;
};

const JudgesRow = ({ data, handleUpdate, isLoading } :Props) => {
  const buttonColor = data.includedInCountyList ? 'error' : 'success';
  const buttonIcon = data.includedInCountyList ? minusIcon : plusIcon;

  const onClick = () => handleUpdate(data);

  return (
    <Row>
      <Cell>{ data.lastFirstMidString }</Cell>
      <Cell>
        <Button
            color={buttonColor}
            isLoading={isLoading}
            onClick={onClick}
            variant="outlined">
          { buttonIcon }
        </Button>
      </Cell>
    </Row>
  );
};

export default JudgesRow;
