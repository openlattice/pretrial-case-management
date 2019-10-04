/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { COLOR_MAP } from '../../utils/consts/RCMResultsConsts';
import ColorSwatches from '../../components/settings/ColorSwatches';
import {
  SETTINGS,
  RCM,
  RCM_DATA
} from '../../utils/consts/AppSettingConsts';


import { updateSetting, deleteRCMCondition } from './SettingsActions';

const BookingHoldSectionWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(${props => props.columns}, 1fr);
`;

const CellContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  font-weight: 600;
  font-size: 14px;
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

  updateColorForLevel = (idx, color) => {
    const { levels, actions } = this.props;
    if (Object.values(levels).length < 6) {
      actions.updateSetting(
        { path: [SETTINGS.RCM, RCM.LEVELS, `${idx}`, RCM_DATA.COLOR], value: color }
      );
    }
  }

  getAvailableColors = () => {
    const { levels } = this.props;
    const usedColors = Object.values(levels).map(level => level[RCM_DATA.COLOR]);
    return Object.keys(COLOR_MAP).filter(color => !usedColors.includes(color));
  }

  getColumns = () => {
    const { levels, editing } = this.props;
    const columns = Object.keys(levels)
      .map(idx => (
        <CellContent key={`RT4Level ${idx}`} align="center">
          <ColorSwatches
              index={idx}
              editing={editing}
              levels={levels}
              updateColorForLevel={this.updateColorForLevel}
              availableColors={this.getAvailableColors()} />
          <div>{`Level ${idx}`}</div>
        </CellContent>
      ));
    return columns;
  }

  render() {
    const columns = this.getColumns();

    return (
      <BookingHoldSectionWrapper columns={columns.length + 1}>
        <CellContent>
          Colors
        </CellContent>
        { columns }
      </BookingHoldSectionWrapper>
    );
  }
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    updateSetting,
    deleteRCMCondition
  }, dispatch)
});

export default connect(null, mapDispatchToProps)(LevelColorsSection);
