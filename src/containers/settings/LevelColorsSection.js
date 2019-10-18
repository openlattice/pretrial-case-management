/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { CardSegment } from 'lattice-ui-kit';

import ColorSwatches from './ColorSwatches';
import { RCM_DATA } from '../../utils/consts/AppSettingConsts';

const BookingHoldSectionWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(${props => props.columns}, 1fr);
  grid-gap: 10px;
`;

const CellContent = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  font-weight: 600;
  font-size: 14px;
`;

const ColorBlock = styled.div`
  height: 40px;
  z-index: 10;
  width: 40px;
  border-radius: 3px;
  margin: 0 5px 1px;
  background: ${props => props.color};
  opacity: ${props => (props.editing ? 'none' : '50%')};
`;

type Props = {
  editing :boolean,
  levels :Object,
  actions :{
    addCondition :() => void,
    updateCondition :() => void,
    removeCondition :() => void,
  }
};

class LevelColorsSection extends React.Component<Props, *> {

  getColumns = () => {
    const { levels } = this.props;
    const columns = Object.keys(levels)
      .map((idx) => {
        const selectedColor = levels[idx][RCM_DATA.COLOR];
        return (
          <CellContent key={`RT4Level ${idx}`} align="center">
            <ColorBlock color={selectedColor} />
            <div>{`Level ${idx}`}</div>
          </CellContent>
        );
      });
    return columns;
  }

  getEditColumns = () => {
    const { levels, editing } = this.props;
    console.log(editing);
    const columns = Object.keys(levels)
      .map(idx => (
        <CellContent key={`RT4Level ${idx}`} align="center">
          <ColorSwatches
              index={idx}
              editing={editing}
              levels={levels} />
        </CellContent>
      ));
    return columns;
  }

  render() {
    const { editing } = this.props;
    const colorBlocks = this.getColumns();
    const colorOptions = this.getEditColumns();

    return (
      <CardSegment vertical>
        <BookingHoldSectionWrapper columns={colorBlocks.length + 1}>
          <CellContent>
            Colors
          </CellContent>
          { colorBlocks }
        </BookingHoldSectionWrapper>
        {
          editing
            ? (
              <BookingHoldSectionWrapper columns={colorOptions.length + 1}>
                <CellContent />
                { colorOptions }
              </BookingHoldSectionWrapper>
            ) : null
        }
      </CardSegment>
    );
  }
}

export default LevelColorsSection;
