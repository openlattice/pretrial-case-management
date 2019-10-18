/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Select } from 'lattice-ui-kit';
import { Map } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { SETTINGS, RCM, RCM_DATA } from '../../utils/consts/AppSettingConsts';
import { COLOR_LABELS, COLOR_MAP } from '../../utils/consts/RCMResultsConsts';


import { updateSetting } from './SettingsActions';

const dot = (color = '#ccc') => ({
  alignItems: 'center',
  display: 'flex',

  ':before': {
    backgroundColor: color,
    borderRadius: 10,
    content: '" "',
    display: 'block',
    marginRight: 8,
    height: 10,
    width: 10,
  },
});

const colourStyles = {
  control: styles => ({ ...styles, backgroundColor: 'white' }),
  option: (styles, { data }) => {
    const { color } = data;
    return {
      ...styles,
      ...dot(color),
    };
  },
  input: styles => ({ ...styles, ...dot() }),
  placeholder: styles => ({ ...styles, ...dot() }),
  singleValue: (styles, { data }) => ({ ...styles, ...dot(data.color) }),
};

const ColorSwatches = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 15px;
  z-index: 100;
`;

type Props = {
  index :number,
  editing :boolean,
  levels :Object,
  actions :{
    addCondition :() => void,
    updateCondition :() => void,
    removeCondition :() => void,
  }
}

class ColorSwatchesSection extends React.Component<Props, *> {

  updateColorForLevel = (value) => {
    const { levels, actions, index } = this.props;
    const { color } = value;
    if (Object.values(levels).length < 6) {
      actions.updateSetting(
        { path: [SETTINGS.RCM, RCM.LEVELS, `${index}`, RCM_DATA.COLOR], value: color }
      );
    }
  }

  getAvailableColors = () => {
    const { levels } = this.props;
    const usedColors = Object.values(levels).map(level => level[RCM_DATA.COLOR]);
    return Object.keys(COLOR_MAP).filter(color => !usedColors.includes(color));
  }

  getAvailableColorObjectList = () => {
    const { index, levels } = this.props;
    const selectedColor = levels[index][RCM_DATA.COLOR];
    const usedColors = Object.values(levels).map(level => level[RCM_DATA.COLOR]);
    const colorMap = Map().withMutations((mutableMap) => {
      Object.keys(COLOR_MAP).forEach((color) => {
        const value = COLOR_MAP[color];
        const label = COLOR_LABELS[color];
        const isAvailable = (color === selectedColor) || !usedColors.includes(color);
        const colorObject = {
          color,
          value,
          label
        };
        if (isAvailable) mutableMap.set(color, colorObject);
      });
    });
    return colorMap.toJS();
  }

  render() {
    const { editing, index, levels } = this.props;

    const selectedColor = levels[index][RCM_DATA.COLOR];
    const colorObjects = this.getAvailableColorObjectList();
    const availableColors = this.getAvailableColors();

    if (!availableColors.length || !editing) return null;

    return (
      <ColorSwatches>
        <Select
            defaultValue={colorObjects[selectedColor]}
            label="Single select"
            options={Object.values(colorObjects)}
            onChange={this.updateColorForLevel}
            styles={colourStyles} />
      </ColorSwatches>
    );
  }
}


const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    updateSetting
  }, dispatch)
});

export default connect(null, mapDispatchToProps)(ColorSwatchesSection);
