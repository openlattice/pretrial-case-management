/*
 * @flow
 */

import React from 'react';
import type { Element } from 'react';

import styled from 'styled-components';
import { Map, fromJS } from 'immutable';
import { CardSegment, Radio } from 'lattice-ui-kit';

import ColorSwatches from './ColorSwatches';

import {
  RCM,
  RCM_DATA,
  SETTINGS
} from '../../utils/consts/AppSettingConsts';
import { COLOR_THEME_MAPS, THEMES } from '../../utils/consts/RCMResultsConsts';

const ColorSubSection = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(${(props) => props.columns}, 1fr);
  grid-gap: 10px;
  margin-bottom: 15px;
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
  background: ${(props) => props.color};
  opacity: ${(props) => (props.editing ? 'none' : '50%')};
`;

type Props = {
  editing :boolean;
  levels :Object;
  settings :Map;
  updateSetting :(value :{ path :string[], value :Map}) => void;
};

class LevelColorsSection extends React.Component<Props, *> {

  getColumns = () => {
    const { levels, editing } = this.props;
    const columns :Element<*>[] = Object.keys(levels)
      .map((idx) => {
        const selectedColor = levels[idx][RCM_DATA.COLOR];
        return (
          <CellContent key={`RT4Level ${idx}`} align="center">
            <ColorBlock editing={editing} color={selectedColor} />
            <div>{`Level ${idx}`}</div>
          </CellContent>
        );
      });
    return columns;
  }

  updateTheme = (e :SyntheticInputEvent<HTMLInputElement>) => {
    const { target } = e;
    const { levels, settings, updateSetting } = this.props;
    let rcmSettings = settings.get(SETTINGS.RCM, Map());
    const nextLevels = levels;
    Object.keys(levels).forEach((level) => {
      const currentColor = levels[level][RCM_DATA.COLOR];
      const nextColor = COLOR_THEME_MAPS[target.value][currentColor];
      nextLevels[level][RCM_DATA.COLOR] = nextColor;
    });
    rcmSettings = rcmSettings.set(RCM.LEVELS, fromJS(nextLevels));
    rcmSettings = rcmSettings.set(RCM.THEME, target.value);
    updateSetting({ path: [SETTINGS.RCM], value: rcmSettings });
  }

  getEditColumns = () => {
    const { editing, levels, settings } = this.props;
    const colorTheme = settings.getIn([SETTINGS.RCM, RCM.THEME], THEMES.OPEN_LATTICE);
    const columns :Element<*>[] = Object.keys(levels).map((level) => (
      <CellContent key={`RT4Level ${level}`} align="center">
        <ColorSwatches
            index={level}
            theme={colorTheme}
            editing={editing}
            levels={levels} />
      </CellContent>
    ));
    return columns;
  }

  render() {
    const { editing, settings } = this.props;
    const colorBlocks = this.getColumns();
    const colorOptions = this.getEditColumns();
    const colorTheme = settings.getIn([SETTINGS.RCM, RCM.THEME], THEMES.CLASSIC);

    return (
      <CardSegment vertical>
        <ColorSubSection columns={6}>
          <CellContent>
            Themes
          </CellContent>
          <CellContent>
            <Radio
                checked={colorTheme === THEMES.CLASSIC}
                disabled={!editing}
                label={THEMES.CLASSIC}
                onChange={this.updateTheme}
                value={THEMES.CLASSIC} />
          </CellContent>
          <CellContent>
            <Radio
                checked={colorTheme === THEMES.OPEN_LATTICE}
                disabled={!editing}
                label={THEMES.OPEN_LATTICE}
                onChange={this.updateTheme}
                value={THEMES.OPEN_LATTICE} />
          </CellContent>
        </ColorSubSection>
        <ColorSubSection columns={colorBlocks.length + 1}>
          <CellContent>
            Colors
          </CellContent>
          { colorBlocks }
        </ColorSubSection>
        {
          editing
            ? (
              <ColorSubSection columns={colorOptions.length + 1}>
                <CellContent />
                { colorOptions }
              </ColorSubSection>
            ) : null
        }
      </CardSegment>
    );
  }
}

export default LevelColorsSection;
