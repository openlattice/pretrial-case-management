/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Card,
  CardSegment,
  EditButton,
  PlusButton
} from 'lattice-ui-kit';

import ReleaseConditionsTable from './ConditionsTable';
import { OL } from '../../utils/consts/Colors';
import { SETTINGS, RCM, RCM_DATA } from '../../utils/consts/AppSettingConsts';


import { STATE } from '../../utils/consts/redux/SharedConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';

import { updateSetting } from './SettingsActions';

const RCMGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-gap: 10px;
`;

const RCMCell = styled.div`
  min-height: 75px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  word-wrap: normal;
  background: ${props => props.color};
`;

const Section = styled.div`
  width: 100%;
  padding: 30px;
  border-bottom: 1px solid ${OL.GREY11};
  display: grid;
  grid-template-columns: 3fr 1fr 1fr;
`;

const HeaderSection = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 18px;
  color: ${OL.GREY01};
  width: 100%;
  padding: 5px;
  button {
    width: 100%;
  }
`;


type Props = {
  settings :Object,
  actions :{
    updateSetting :RequestSequence;
  };
};

class RCMSettings extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = { editing: false };
  }

  getLevels = () => {
    const { settings } = this.props;
    const levels = settings[SETTINGS.RCM][RCM.LEVELS];
    Object.keys(levels).forEach((idx) => {
      if (!levels[idx].active) delete levels[idx];
    });
    return levels;
  }

  getConditions = () => {
    const { settings } = this.props;
    return settings[SETTINGS.RCM][RCM.CONDITIONS];
  }

  getMatrix = () => {
    const { settings } = this.props;
    return settings[SETTINGS.RCM][RCM.MATRIX];
  }

  getConditionsForCell = (level) => {
    const conditions = this.getConditions();
    const cellConditions = [];
    Object.values(conditions).forEach((condition) => {
      const isCurrentLevel = condition[level];
      if (isCurrentLevel) {
        cellConditions.push(condition.description);
      }
    });
    return cellConditions;
  }

  getCellInfo = (ftaScore, ncaScore) => {
    const matrix = this.getMatrix();
    return matrix[ftaScore][ncaScore];
  }

  getCell = (ftaScore, ncaScore) => {
    const levels = this.getLevels();
    const cellInfo = this.getCellInfo(ftaScore, ncaScore);
    let cellConditions = [];
    let cellColor = '#8e929b';
    if (cellInfo) {
      const levelNumber = cellInfo[RCM_DATA.LEVEL];
      cellColor = levels[levelNumber][RCM_DATA.COLOR];
      cellConditions = this.getConditionsForCell(levelNumber);
    }
    return (
      <RCMCell
          key={`FTA ${ftaScore} NCA ${ncaScore}`}
          onClick={() => this.changeConditionLevel(ftaScore, ncaScore)}
          color={cellColor}>
        { cellConditions.join(',') }
      </RCMCell>
    );
  }

  changeConditionLevel = (ftaScore, ncaScore) => {
    const { editing } = this.state;
    const { actions } = this.props;
    const matrix = this.getMatrix();
    const levels = this.getLevels();
    const cellInfo = this.getCellInfo(ftaScore, ncaScore);
    if (editing && cellInfo) {
      const currentLevel = cellInfo[RCM_DATA.LEVEL];
      const nextLevel = (levels[currentLevel + 1] && levels[currentLevel + 1].active) ? currentLevel + 1 : 1;
      matrix[ftaScore][ncaScore][RCM_DATA.LEVEL] = nextLevel;
      actions.updateSetting({ path: [SETTINGS.RCM, RCM.MATRIX], value: matrix });
    }
  }

  getCells = () => {
    const rcmCells = [];
    for (let ftaScore = 1; ftaScore <= 6; ftaScore += 1) {
      rcmCells.push(<RCMCell key={`FTA ${ftaScore}`} color="#eaeaf0">{`FTA ${ftaScore}`}</RCMCell>);
      for (let ncaScore = 1; ncaScore <= 6; ncaScore += 1) {
        const cell = this.getCell(ftaScore, ncaScore);
        rcmCells.push(cell);
      }
    }
    return rcmCells;
  }

  getHeaderRow = () => (
    <>
      <RCMCell color="#eaeaf0" />
      <RCMCell color="#eaeaf0">NCA 1</RCMCell>
      <RCMCell color="#eaeaf0">NCA 2</RCMCell>
      <RCMCell color="#eaeaf0">NCA 3</RCMCell>
      <RCMCell color="#eaeaf0">NCA 4</RCMCell>
      <RCMCell color="#eaeaf0">NCA 5</RCMCell>
      <RCMCell color="#eaeaf0">NCA 6</RCMCell>
    </>
  )

  renderMatrix = () => (
    <CardSegment vertical>
      <RCMGrid>
        { this.getHeaderRow() }
        { this.getCells() }
      </RCMGrid>
    </CardSegment>
  )

  renderConditionsTable = () => {
    const { editing } = this.state;
    const conditions = this.getConditions();
    const levels = this.getLevels();
    return (
      <ReleaseConditionsTable
          editing={editing}
          conditions={Object.values(conditions)}
          levels={levels} />
    );
  }

  startEdit = () => this.setState({ editing: true });
  cancelEdit = () => this.setState({ editing: false });

  addLevel = () => {
    const { actions } = this.props;
    const levels = this.getLevels();
    const nextLevel = Object.keys(levels).length + 1;
    console.log(nextLevel);
    if (nextLevel <= 6) {
      actions.updateSetting({ path: [SETTINGS.RCM, RCM.LEVELS, `${nextLevel}`, RCM_DATA.ACTIVE], value: true });
    }
  }

  renderHeader = () => {
    const { editing } = this.state;
    return (
      <Section>
        <HeaderSection>Manage RCM</HeaderSection>
        <HeaderSection>
          {
            editing
              ? <PlusButton mode="positive" onClick={this.addLevel}>Add Level</PlusButton>
              : <div />
          }
        </HeaderSection>
        <HeaderSection>
          {
            editing
              ? <EditButton onClick={this.cancelEdit}>Cancel</EditButton>
              : <EditButton onClick={this.startEdit}>Edit</EditButton>
          }
        </HeaderSection>
      </Section>
    );
  }

  render() {
    return (
      <Card>
        {this.renderHeader()}
        {this.renderConditionsTable()}
        {this.renderMatrix()}
      </Card>
    );
  }
}


function mapStateToProps(state) {
  const settings = state.get(STATE.SETTINGS);
  return {
    settings: settings.get(SETTINGS_DATA.APP_SETTINGS).toJS()
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    updateSetting
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(RCMSettings);
