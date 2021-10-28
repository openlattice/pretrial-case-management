/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Select } from 'lattice-ui-kit';
import { Map } from 'immutable';
import { bindActionCreators } from 'redux';
import type { Dispatch } from 'redux';
import { connect } from 'react-redux';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';
import { SETTINGS, RCM, RCM_DATA } from '../../utils/consts/AppSettingConsts';
import { COLOR_LABELS, COLOR_THEMES, THEMES } from '../../utils/consts/RCMResultsConsts';
import { getActiveRCMLevels } from '../../utils/RCMUtils';

import { updateSetting } from '../settings/SettingsActions';

const dot = (color = '#ccc') => ({
  alignItems: 'center',
  display: 'flex',

  ':before': {
    backgroundColor: color,
    borderRadius: 10,
    content: '" "',
    display: 'block',
    marginRight: 5,
    height: 10,
    width: 10,
  },
});

const colourStyles = {
  control: (styles) => ({ ...styles, backgroundColor: 'white' }),
  option: (styles, { data }) => {
    const { color } = data;
    return {
      ...styles,
      ...dot(color),
    };
  },
  input: (styles) => ({ ...styles, ...dot() }),
  placeholder: (styles) => ({ ...styles, ...dot() }),
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
  actions :{
    addCondition :() => void;
    removeCondition :() => void;
    updateCondition :() => void;
    updateSetting :(value :{ path :string[], value :any }) => void;
  };
  index :number;
  editing :boolean;
  settings :Map;
}

class ColorSwatchesSection extends React.Component<Props, *> {

  updateColorForLevel = (value :Object) => {
    const { actions, index, settings } = this.props;
    const levels = getActiveRCMLevels(settings);
    const { color } = value;
    if (Object.values(levels).length < 6) {
      actions.updateSetting(
        { path: [SETTINGS.RCM, RCM.LEVELS, `${index}`, RCM_DATA.COLOR], value: color }
      );
    }
  }

  getAvailableColors = () :string[] => {
    const { settings } = this.props;
    const colorTheme = settings.getIn([SETTINGS.RCM, RCM.THEME], THEMES.CLASSIC);
    const levels = settings.getIn([SETTINGS.RCM, RCM.LEVELS], Map()).toJS();
    // $FlowFixMe
    const usedColors = Object.values(levels).map((level) => level[RCM_DATA.COLOR]);
    return Object.keys(COLOR_THEMES[colorTheme]).filter((color) => !usedColors.includes(color));
  }

  getAvailableColorObjectList = () => {
    const { index, settings } = this.props;
    const colorTheme = settings.getIn([SETTINGS.RCM, RCM.THEME], THEMES.CLASSIC);
    const levels = settings.getIn([SETTINGS.RCM, RCM.LEVELS], Map()).toJS();
    const selectedColor = levels[index][RCM_DATA.COLOR];
    // $FlowFixMe
    const usedColors = Object.values(levels).map((level) => level[RCM_DATA.COLOR]);
    const colorMap = Map().withMutations((mutableMap) => {
      Object.keys(COLOR_THEMES[colorTheme]).forEach((color) => {
        const value = COLOR_THEMES[colorTheme][color];
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
    const { editing, index, settings } = this.props;
    const levels = settings.getIn([SETTINGS.RCM, RCM.LEVELS], Map()).toJS();

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

function mapStateToProps(state) {
  const settings = state.getIn([STATE.SETTINGS, SETTINGS_DATA.APP_SETTINGS], Map());
  return {
    settings
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    updateSetting
  }, dispatch)
});
// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ColorSwatchesSection);
