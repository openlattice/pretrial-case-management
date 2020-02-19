/* @flow */
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { CardSegment } from 'lattice-ui-kit';

import { OL } from '../../utils/consts/Colors';
import { BOOKING_CONDITIONS, TEXT_COLOR_MAPPINGS } from '../../utils/consts/RCMResultsConsts';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getEntityProperties } from '../../utils/DataUtils';
import { RCM_DATA } from '../../utils/consts/AppSettingConsts';
import {
  getRCMSettings,
  getRCMConditions,
  getRCMMatrix,
  getRCMLevels,
  getActiveRCMLevels
} from '../../utils/RCMUtils';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';

const { FTA_SCALE, NCA_SCALE } = PROPERTY_TYPES;

const RCMGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-gap: 10px;
`;

const RCMCell = styled.div`
  min-height: 75px;
  font-family: 'Open Sans', sans-serif;
  font-weight: 600;
  font-size: 12px;
  padding: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  word-wrap: normal;
  color: ${(props :Object) => TEXT_COLOR_MAPPINGS[props.color]}};
  background: ${(props :Object) => props.color};
  opacity: ${(props :Object) => (props.opaque ? '1' : '0.5')};
`;

type Props = {
  bookingView :boolean;
  disabled :boolean;
  settings :Object;
  changeConditionLevel :(ncaScore :number, ftaScore :number) => void;
  scores :Map;
};

class RCMSettings extends React.Component<Props, *> {

  getLevels = (all ?:boolean) => {
    const { settings } = this.props;
    const rcmSettings = getRCMSettings(settings);
    const levels = getRCMLevels(rcmSettings).toJS();
    if (all) return levels;
    return getActiveRCMLevels(rcmSettings).toJS();
  }

  getConditions = () => {
    const { settings } = this.props;
    const rcmSettings = getRCMSettings(settings);
    return getRCMConditions(rcmSettings).toJS();
  }

  getMatrix = () => {
    const { settings } = this.props;
    const rcmSettings = getRCMSettings(settings);
    return getRCMMatrix(rcmSettings).toJS();
  }

  getConditionsForCell = (level :number) => {
    const conditions = this.getConditions();
    const cellConditions = [];
    Object.values(conditions).forEach((condition :Object) => {
      const isCurrentLevel = condition[level];
      if (isCurrentLevel) {
        cellConditions.push(condition.description);
      }
    });
    return cellConditions;
  }

  getCellInfo = (ncaScore :number, ftaScore :number) => {
    const matrix = this.getMatrix();
    return matrix[ncaScore][ftaScore];
  }

  handleConditionLevelChange = (ncaScore :number, ftaScore :number) => {
    const { changeConditionLevel } = this.props;
    if (changeConditionLevel) changeConditionLevel(ncaScore, ftaScore);
  }

  getCell = (ncaScore :number, ftaScore :number) => {
    const { scores, bookingView, disabled } = this.props;
    let selected = true;
    if (scores) {
      const {
        [FTA_SCALE]: fta,
        [NCA_SCALE]: nca
      } = getEntityProperties(scores, [FTA_SCALE, NCA_SCALE]);
      selected = (ncaScore === nca) && (ftaScore === fta);
    }
    if (disabled) selected = false;
    const levels = this.getLevels();
    const cellInfo = this.getCellInfo(ncaScore, ftaScore);
    let cellConditions = [];
    let cellColor = '#8e929b';
    let label;
    let levelNumber;
    if (cellInfo) {
      levelNumber = cellInfo[RCM_DATA.LEVEL];
      cellColor = levels[levelNumber][RCM_DATA.COLOR];
      cellConditions = this.getConditionsForCell(levelNumber);
      label = cellConditions.join(', ');
    }
    if (levelNumber && bookingView) {
      label = levels[levelNumber][RCM_DATA.BOOKING_HOLD] ? BOOKING_CONDITIONS.HOLD : BOOKING_CONDITIONS.RELEASE;
    }
    return (
      <RCMCell
          key={`FTA ${ftaScore} NCA ${ncaScore}`}
          opaque={selected}
          onClick={() => this.handleConditionLevelChange(ncaScore, ftaScore)}
          color={cellColor}>
        { label }
      </RCMCell>
    );
  }

  getCells = () => {
    const rcmCells = [];
    for (let ftaScore = 1; ftaScore <= 6; ftaScore += 1) {
      rcmCells.push(<RCMCell key={`FTA ${ftaScore}`} color={OL.GREY07}>{`FTA ${ftaScore}`}</RCMCell>);
      for (let ncaScore = 1; ncaScore <= 6; ncaScore += 1) {
        const cell = this.getCell(ncaScore, ftaScore);
        rcmCells.push(cell);
      }
    }
    return rcmCells;
  }

  getHeaderRow = () => (
    <>
      <RCMCell color={OL.WHITE} />
      <RCMCell color={OL.GREY07}>NCA 1</RCMCell>
      <RCMCell color={OL.GREY07}>NCA 2</RCMCell>
      <RCMCell color={OL.GREY07}>NCA 3</RCMCell>
      <RCMCell color={OL.GREY07}>NCA 4</RCMCell>
      <RCMCell color={OL.GREY07}>NCA 5</RCMCell>
      <RCMCell color={OL.GREY07}>NCA 6</RCMCell>
    </>
  )

  render() {
    return (
      <CardSegment vertical>
        <RCMGrid>
          { this.getHeaderRow() }
          { this.getCells() }
        </RCMGrid>
      </CardSegment>
    );
  }
}


function mapStateToProps(state) {
  const settings = state.getIn([STATE.SETTINGS, SETTINGS_DATA.APP_SETTINGS], Map());
  return {
    settings
  };
}
// $FlowFixMe
export default connect(mapStateToProps, null)(RCMSettings);
