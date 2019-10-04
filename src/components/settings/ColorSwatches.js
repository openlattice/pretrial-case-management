/*
 * @flow
 */

import React from 'react';
import styled, { keyframes } from 'styled-components';

import { RCM_DATA } from '../../utils/consts/AppSettingConsts';

const KeyFrames = keyframes`
  0%{
    transform: translateY(-20px);
  }
  100%{
    transform: translateY(0px);
  }
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

const MovingColorBlock = styled.div`
  position: absolute;
  height: 20px;
  width: 40px;
  border-radius: 0 0 3px 3px;
  margin: ${props => props.index * 20}px 5px 1px;
  background: ${props => props.color};
  visibility: ${props => (props.editing ? 'none' : 'visibile')};
  animation: ${KeyFrames} 0.5s ease;
`;

const ColorSwatches = styled.div`
  display: flex;
  flex-direction: column;
`;
const AvailableSwatches = styled.div`
  display: flex;
  padding: 5px 0 0 0;
  flex-direction: column;
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

class ColorSwatchesSection extends React.Component<Props, *> {
  constructor(props :Props) {
    super(props);
    this.state = { editingColor: false };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { editing } = nextProps;
    const { editingColor } = prevState;
    if (editingColor && !editing) {
      return { editingColor: true };
    }
    return null;
  }

  editColors = () => {
    const { editingColor } = this.state;
    const { editing } = this.props;
    if (editing) {
      this.setState({ editingColor: !editingColor });
    }
  }

  render() {
    const { editingColor } = this.state;
    const {
      editing,
      index,
      levels,
      updateColorForLevel,
      availableColors
    } = this.props;

    return (
      <ColorSwatches>
        <ColorBlock
            editing={editingColor}
            color={levels[index][RCM_DATA.COLOR]}
            onClick={this.editColors} />
        <AvailableSwatches>
          {
            editingColor ? availableColors.map((color, idx) => (
              <MovingColorBlock
                  notSelected
                  editing={editingColor}
                  color={color}
                  index={idx}
                  onClick={() => updateColorForLevel(index, color)} />
            )) : null
          }
        </AvailableSwatches>
      </ColorSwatches>
    );
  }
}

export default ColorSwatchesSection;
