/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { fromJS, Map } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Button,
  CardSegment,
  MinusButton,
  PlusButton
} from 'lattice-ui-kit';

import BookingHoldSection from './BookingHoldSection';
import LevelColorsSection from './LevelColorsSection';
import ReleaseConditionsTable from '../../components/settings/ConditionsTable';
import ReleaseTypeTable from '../../components/settings/ReleaseTypeTable';
import ToggleButtons from '../../components/buttons/ToggleButtons';
import RCMMatrix from '../../components/rcm/RCMMatrix';
import { HeaderSection } from '../../components/settings/SettingsStyledComponents';
import {
  getRCMSettings,
  getRCMConditions,
  getRCMMatrix,
  getRCMLevels,
  getActiveRCMLevels
} from '../../utils/RCMUtils';
import {
  SETTINGS,
  CONTEXTS,
  CONTEXT_OPTIONS,
  RCM,
  RCM_DATA
} from '../../utils/consts/AppSettingConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';

import { submitSettings, updateSetting } from './SettingsActions';

const SubmitRow = styled.div`
  width: 100%;
  padding: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const StyledCell = styled.div`
  padding: 10px;
  text-align: ${(props) => props.align || 'left'};
  word-wrap: break-word;
`;

const ToggleWrapper = styled(StyledCell)`
  padding: 30px;
`;


type Props = {
  editing :boolean,
  settings :Object,
  actions :{
    submitSettings :RequestSequence;
    updateSetting :RequestSequence;
  };
};

class RCMSettings extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      bookingView: false
    };
  }

  getLevels = (all) => {
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

  isReadyToSubmit = () => {
    const levels = this.getLevels();
    const conditions = this.getConditions();
    return fromJS(levels)
      .keySeq().every((level) => fromJS(conditions).valueSeq().some((condition) => condition.get(level, false)));
  }

  getCellInfo = (ncaScore, ftaScore) => {
    const matrix = this.getMatrix();
    return matrix[ncaScore][ftaScore];
  }

  changeConditionLevel = (ncaScore, ftaScore) => {
    const { actions, editing } = this.props;
    const matrix = this.getMatrix();
    const levels = this.getLevels();
    const cellInfo = this.getCellInfo(ncaScore, ftaScore);
    if (editing && cellInfo) {
      const currentLevel = cellInfo[RCM_DATA.LEVEL];
      const nextLevel = (levels[currentLevel + 1] && levels[currentLevel + 1].active) ? currentLevel + 1 : 1;
      matrix[ncaScore][ftaScore][RCM_DATA.LEVEL] = nextLevel;
      actions.updateSetting({ path: [SETTINGS.RCM, RCM.MATRIX], value: fromJS(matrix) });
    }
  }


  renderMatrix = () => {
    const { bookingView } = this.state;
    return <RCMMatrix bookingView={bookingView} changeConditionLevel={this.changeConditionLevel} />;
  }

  renderConditionsTable = () => {
    const { bookingView } = this.state;
    const { editing } = this.props;
    const conditions = this.getConditions();
    const levels = this.getLevels();
    const conditionValues = Object.values(conditions).map((condition, idx) => {
      const mappedCondition = condition;
      mappedCondition.id = idx;
      return mappedCondition;
    });
    if (editing) conditionValues.push({ id: 'emptyOption' });
    return (!bookingView)
      ? (
        <ReleaseConditionsTable
            editing={editing}
            conditions={conditionValues}
            levels={levels} />
      ) : null;
  }

  addLevel = () => {
    const { actions } = this.props;
    const levels = this.getLevels();
    const nextLevel = Object.keys(levels).length + 1;
    if (nextLevel <= 6) {
      actions.updateSetting({ path: [SETTINGS.RCM, RCM.LEVELS, `${nextLevel}`, RCM_DATA.ACTIVE], value: true });
    }
  }

  removeLevel = () => {
    const { actions } = this.props;
    const allLevels = this.getLevels(true);
    const activeLevels = this.getLevels();
    const matrix = this.getMatrix();
    const conditions = this.getConditions();
    const lastLevel = Object.keys(activeLevels).length;
    if (lastLevel > 3) {
      allLevels[lastLevel][RCM_DATA.ACTIVE] = false;
      const nextConditions = Map().withMutations((mutableMap) => {
        Object.values(conditions).forEach((condition) => {
          if (condition.description) {
            const nextCondition = condition;
            nextCondition[lastLevel] = false;
            mutableMap.set(condition.description, nextCondition);
          }
        });
      });
      for (let ftaScore = 1; ftaScore <= 6; ftaScore += 1) {
        for (let ncaScore = 1; ncaScore <= 6; ncaScore += 1) {
          if (matrix[ftaScore][ncaScore]) {
            const currentLevel = matrix[ftaScore][ncaScore][RCM_DATA.LEVEL];
            if (currentLevel === lastLevel) {
              matrix[ftaScore][ncaScore][RCM_DATA.LEVEL] = lastLevel - 1;
            }
          }
        }
      }
      const nextRCM = fromJS({
        [RCM.CONDITIONS]: nextConditions,
        [RCM.MATRIX]: matrix,
        [RCM.LEVELS]: allLevels,
      });
      actions.updateSetting({ path: [SETTINGS.RCM], value: nextRCM });
    }
  }

  includesBookingContext = () => {
    const { settings } = this.props;
    return settings.getIn([SETTINGS.CONTEXTS, CONTEXTS.BOOKING], false);
  }

  renderBookingHoldSection = () => {
    const { bookingView } = this.state;
    const { editing } = this.props;
    const levels = this.getLevels();
    const includesBookingContext = this.includesBookingContext();
    return includesBookingContext && bookingView
      ? <CardSegment><BookingHoldSection editing={editing} levels={levels} /></CardSegment> : null;
  }

  renderLevelColorsSection = () => {
    const { editing } = this.props;
    const levels = this.getLevels();
    return <CardSegment><LevelColorsSection editing={editing} levels={levels} /></CardSegment>;
  }

  renderReleaseTypeTable = () => {
    const { bookingView } = this.state;
    const { editing } = this.props;
    const includesBookingContext = this.includesBookingContext();
    const levels = this.getLevels();
    return !bookingView
      ? (
        <ReleaseTypeTable
            includesBookingContext={includesBookingContext}
            editing={editing}
            levels={levels} />
      ) : null;
  }

  renderContextToggle = () => {
    const { bookingView } = this.state;
    const includesBookingContext = this.includesBookingContext();
    const selectedValue = bookingView ? CONTEXT_OPTIONS[1] : CONTEXT_OPTIONS[0];
    return (includesBookingContext)
      ? (
        <ToggleWrapper align="center">
          <ToggleButtons
              options={CONTEXT_OPTIONS}
              selectedOption={selectedValue.value}
              onSelect={(value) => {
                this.setState({ bookingView: value === CONTEXTS.BOOKING });
              }} />
        </ToggleWrapper>
      ) : null;
  }

  renderHeader = () => {
    const { editing } = this.props;
    const numOfActiveLevels = Object.values(this.getLevels()).length;
    return (
      <CardSegment>
        <HeaderSection>Manage RCM</HeaderSection>
        <HeaderSection>
          <div>
            {
              editing
                ? (
                  <>
                    <PlusButton
                        mode="positive"
                        disabled={numOfActiveLevels === 6}
                        onClick={this.addLevel}>
                        Level
                    </PlusButton>
                    <MinusButton
                        mode="negative"
                        disabled={numOfActiveLevels === 3}
                        onClick={this.removeLevel}>
                        Level
                    </MinusButton>
                  </>
                )
                : <div />
            }
          </div>
        </HeaderSection>
      </CardSegment>
    );
  }

  render() {
    const { actions, editing } = this.props;
    return (
      <>
        {this.renderHeader()}
        {this.renderContextToggle()}
        {this.renderMatrix()}
        {this.renderLevelColorsSection()}
        {this.renderBookingHoldSection()}
        {this.renderReleaseTypeTable()}
        {this.renderConditionsTable()}
        {
          editing
            ? (
              <SubmitRow>
                <Button mode="primary" disabled={!this.isReadyToSubmit()} onClick={actions.submitSettings}>
                  Submit
                </Button>
              </SubmitRow>
            ) : null
        }
      </>
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
    submitSettings,
    updateSetting
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(RCMSettings);
